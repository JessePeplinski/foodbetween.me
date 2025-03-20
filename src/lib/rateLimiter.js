// src/lib/rateLimiter.js
import { NextResponse } from 'next/server';

// Simple in-memory cache for rate limiting
// Note: This will reset when the serverless function cold starts
const ipRequestCounts = new Map();

/**
 * Simple rate limiter for Netlify serverless functions
 * @param {Request} request - The incoming request object
 * @param {Object} options - Rate limiting options
 * @param {number} options.maxRequests - Maximum requests allowed in the time window (default: 60)
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 - 1 minute)
 * @returns {NextResponse|null} - Error response if rate limited, null if allowed
 */
export function rateLimit(request, options = {}) {
  // Default settings: 60 requests per minute
  const maxRequests = options.maxRequests || 60;
  const windowMs = options.windowMs || 60000; // 1 minute in milliseconds
  
  // Get client IP from Netlify headers or request
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('client-ip') ||
    'unknown-ip';
    
  // Get current timestamp
  const now = Date.now();
  
  // Initialize or get IP data
  const ipData = ipRequestCounts.get(ip) || { count: 0, resetTime: now + windowMs };
  
  // If the reset time has passed, reset the counter
  if (now > ipData.resetTime) {
    ipData.count = 0;
    ipData.resetTime = now + windowMs;
  }
  
  // Increment the request count
  ipData.count += 1;
  
  // Update the map
  ipRequestCounts.set(ip, ipData);
  
  // Clean up map occasionally (every ~100 requests)
  if (Math.random() < 0.01) {
    for (const [storedIp, data] of ipRequestCounts.entries()) {
      if (now > data.resetTime) {
        ipRequestCounts.delete(storedIp);
      }
    }
  }
  
  // Generate rate limit headers
  const rateLimitHeaders = {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - ipData.count).toString(),
    'X-RateLimit-Reset': Math.ceil(ipData.resetTime / 1000).toString()
  };
  
  // Check if rate limit exceeded
  if (ipData.count > maxRequests) {
    const retryAfter = Math.ceil((ipData.resetTime - now) / 1000);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Rate limit exceeded', 
        message: `Too many requests from this IP, please try again in ${retryAfter} seconds` 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          ...rateLimitHeaders
        }
      }
    );
  }
  
  // If not rate limited, return null (allowing the request to proceed) with rate limit info
  return {
    isRateLimited: false,
    headers: rateLimitHeaders,
    getResponse: (data, status = 200) => {
      return NextResponse.json(data, {
        status,
        headers: rateLimitHeaders
      });
    }
  };
}