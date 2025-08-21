import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  MoreVertical, 
  Star, 
  Archive,
  Trash2,
  Download,
  Shield,
  Paperclip,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Clock,
  User
} from 'lucide-react';

interface MailViewerProps {
  emailId?: string;
}

export function MailViewer({ emailId }: MailViewerProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(true);

  if (!emailId) {
    return (
      <div className="email-viewer flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mono-title mb-2">Secure Email</h3>
          <p className="mono-text text-muted-foreground mb-4">
            Select an email to view encrypted content
          </p>
          <div className="space-y-2 mono-text-small text-muted-foreground">
            <p>✓ End-to-end encrypted</p>
            <p>✓ Client-side decryption</p>
            <p>✓ Zero-knowledge architecture</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock email data (in real app this would come from props/context)
  const email = {
    id: emailId,
    from: '0x742d35Cc6634C0532925a3b8D04de85c4a7C8D3f',
    fromName: 'security.eth',
    to: ['0x8ba1f109551bD432803012645Hac136c15ce2BD'],
    toName: ['user.eth'],
    cc: [],
    bcc: [],
    subject: 'DeFi Protocol Security Audit Results',
    timestamp: '2024-01-15T14:30:00Z',
    content: `Dear Protocol Team,

I hope this message finds you well. I'm pleased to share the comprehensive security audit results for your new liquidity mining protocol.

## Executive Summary

The audit identified several key areas for improvement:

1. **Smart Contract Security**: Overall strong implementation with minor gas optimizations possible
2. **Access Control**: Robust permissions system in place
3. **Economic Model**: Well-designed tokenomics with sustainable incentive structure

## Detailed Findings

### High Priority Items
- None identified ✅

### Medium Priority Items  
- Gas optimization opportunities in the reward calculation function
- Consider implementing emergency pause mechanism

### Low Priority Items
- Documentation could be expanded for complex functions
- Additional unit tests for edge cases

## Recommendations

Based on our analysis, I recommend proceeding with deployment after addressing the medium priority items. The protocol demonstrates solid security practices and economic design.

Please find the detailed technical report attached. I'm available for any questions or clarifications you may need.

Best regards,
Security Team`,
    isStarred: true,
    labels: ['work', 'audit', 'important'],
    attachments: [
      {
        id: '1',
        name: 'security-audit-report-v2.1.pdf',
        size: '2.4 MB',
        type: 'application/pdf'
      },
      {
        id: '2', 
        name: 'smart-contract-analysis.xlsx',
        size: '890 KB',
        type: 'application/xlsx'
      }
    ],
    encryptionInfo: {
      algorithm: 'NaCl Box + Secretbox',
      keyExchange: 'X25519',
      authenticated: true,
      integrityVerified: true
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string) => {
    if (address.includes('.eth')) return address;
    if (address.includes('@')) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="email-viewer flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
            <Button size="sm" variant="outline">
              <ReplyAll className="w-4 h-4 mr-1" />
              Reply All
            </Button>
            <Button size="sm" variant="outline">
              <Forward className="w-4 h-4 mr-1" />
              Forward
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost">
              <Star className={`w-4 h-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button size="sm" variant="ghost">
              <Archive className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="mono-title text-xl font-bold">{email.subject}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {email.fromName ? email.fromName[0].toUpperCase() : email.from[2]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="mono-text font-medium">
                    {email.fromName || truncateAddress(email.from)}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-auto p-1"
                    onClick={() => handleCopyAddress(email.from)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="mono-text-small text-muted-foreground">
                  to {email.toName?.[0] || truncateAddress(email.to[0])}
                  {email.to.length > 1 && ` +${email.to.length - 1} more`}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mono-text-small text-muted-foreground">
                {formatDate(email.timestamp)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span className="mono-text-small text-green-600">Encrypted</span>
              </div>
            </div>
          </div>

          {/* Labels */}
          {email.labels.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {email.labels.map((label) => (
                <Badge key={label} variant="outline" className="mono-text-small">
                  {label}
                </Badge>
              ))}
            </div>
          )}

          {/* Security Info */}
          <div className="bg-muted/50 p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="mono-text-small font-medium text-green-600">
                Message Decrypted Successfully
              </span>
              <Button
                size="sm"
                variant="ghost" 
                className="h-auto p-1 ml-auto"
                onClick={() => setShowHeaders(!showHeaders)}
              >
                {showHeaders ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
            
            {showHeaders && (
              <div className="space-y-1 mono-text-small text-muted-foreground">
                <p>Algorithm: {email.encryptionInfo.algorithm}</p>
                <p>Key Exchange: {email.encryptionInfo.keyExchange}</p>
                <p>Authentication: ✓ Verified</p>
                <p>Integrity: ✓ Verified</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4" />
                <span className="mono-text-small font-medium">
                  {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-2">
                {email.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted flex items-center justify-center">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="mono-text-small font-medium">{attachment.name}</p>
                        <p className="mono-text-small text-muted-foreground">{attachment.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
            </div>
          )}

          {/* Email Body */}
          <div className="prose prose-sm max-w-none">
            <div className="mono-text whitespace-pre-wrap leading-relaxed">
              {email.content}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 mono-text-small text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Decrypted in 45ms</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Sender verified</span>
            </div>
          </div>
          
          <Button size="sm" variant="outline">
            <ExternalLink className="w-4 h-4 mr-1" />
            View Raw
          </Button>
        </div>
      </div>
    </div>
  );
}