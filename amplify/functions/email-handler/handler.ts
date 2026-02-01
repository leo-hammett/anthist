import type { Handler, SESEvent, SESEventRecord } from 'aws-lambda';

interface ProcessedEmail {
  success: boolean;
  message: string;
  urls: string[];
}

/**
 * Email Handler Lambda
 * 
 * Processes incoming emails via AWS SES:
 * 1. Extracts URLs from email body
 * 2. Looks up user by their import email address
 * 3. Creates content entries for each URL
 * 4. Triggers content processor for each URL
 */
export const handler: Handler<SESEvent, ProcessedEmail> = async (event) => {
  console.log('Processing SES event:', JSON.stringify(event, null, 2));

  const results: ProcessedEmail[] = [];

  for (const record of event.Records) {
    const result = await processEmailRecord(record);
    results.push(result);
  }

  // Return first result (typically one email per invocation)
  return results[0] ?? { success: false, message: 'No records', urls: [] };
};

async function processEmailRecord(record: SESEventRecord): Promise<ProcessedEmail> {
  const { mail } = record.ses;
  
  // Extract recipient (the importer email address)
  const recipientEmail = mail.destination[0];
  console.log('Recipient:', recipientEmail);

  // Extract sender
  const senderEmail = mail.source;
  console.log('Sender:', senderEmail);

  // The email body would be in S3 if configured with S3 action
  // For now, we'll process the basic headers
  
  // TODO: Fetch email from S3
  // TODO: Parse email body for URLs
  // TODO: Look up user by importerEmail
  // TODO: Create content entries
  // TODO: Trigger content processor

  // Example URL extraction from subject (simple case)
  const subject = mail.commonHeaders.subject ?? '';
  const urls = extractUrls(subject);

  // Also check for URLs in headers (some email clients put the shared URL there)
  const messageId = mail.messageId;
  
  if (urls.length === 0) {
    return {
      success: false,
      message: 'No URLs found in email',
      urls: [],
    };
  }

  console.log('Found URLs:', urls);

  // TODO: Process each URL
  // For each URL:
  // 1. Look up user by recipientEmail
  // 2. Create Content entry
  // 3. Invoke content-processor Lambda

  return {
    success: true,
    message: `Found ${urls.length} URL(s) to process`,
    urls,
  };
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"']+/gi;
  const matches = text.match(urlPattern) ?? [];
  
  // Clean up URLs (remove trailing punctuation)
  return matches.map(url => url.replace(/[.,;:!?)]+$/, ''));
}

/**
 * Validate URL is something we can process
 */
function isValidContentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Block certain domains
    const blockedDomains = [
      'unsubscribe',
      'tracking',
      'pixel',
      'analytics',
    ];
    
    if (blockedDomains.some(d => parsed.hostname.includes(d))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
