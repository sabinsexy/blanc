import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Star, 
  Archive,
  Trash2,
  MailOpen,
  Mail,
  Paperclip,
  Shield,
  Clock
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  isEncrypted: boolean;
  labels: string[];
}

interface MailListProps {
  selectedEmailId?: string;
  onEmailSelect?: (emailId: string) => void;
}

export function MailList({ selectedEmailId, onEmailSelect }: MailListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Mock email data
  const emails: Email[] = [
    {
      id: '1',
      from: '0x742d35Cc6634C0532925a3b8D04de85c4a7C8D3f',
      subject: 'DeFi Protocol Security Audit Results',
      preview: 'The comprehensive security audit has been completed for the new liquidity mining protocol...',
      timestamp: '2h ago',
      isRead: false,
      isStarred: true,
      hasAttachments: true,
      isEncrypted: true,
      labels: ['work', 'important']
    },
    {
      id: '2', 
      from: 'vitalik.eth',
      subject: 'Ethereum Roadmap Update',
      preview: 'Latest developments in the Ethereum roadmap including proto-danksharding and account abstraction...',
      timestamp: '4h ago',
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      isEncrypted: true,
      labels: ['crypto']
    },
    {
      id: '3',
      from: '0x8ba1f109551bD432803012645Hac136c15ce2BD',
      subject: 'NFT Collection Launch',
      preview: 'Exciting news! Our new NFT collection is launching next week. Here are the details...',
      timestamp: '1d ago',
      isRead: false,
      isStarred: false,
      hasAttachments: true,
      isEncrypted: true,
      labels: ['personal', 'nft']
    },
    {
      id: '4',
      from: 'dao@compound.finance',
      subject: 'Governance Proposal #127 - Vote Required',
      preview: 'A new governance proposal requires your attention. Please review and cast your vote...',
      timestamp: '2d ago',
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      isEncrypted: true,
      labels: ['dao', 'governance']
    },
    {
      id: '5',
      from: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      subject: 'Uniswap V4 Beta Access',
      preview: 'Congratulations! You have been selected for early access to Uniswap V4 beta testing...',
      timestamp: '3d ago',
      isRead: false,
      isStarred: true,
      hasAttachments: false,
      isEncrypted: true,
      labels: ['defi', 'beta']
    }
  ];

  const truncateAddress = (address: string) => {
    if (address.includes('.eth')) return address;
    if (address.includes('@')) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleEmailClick = (emailId: string) => {
    onEmailSelect?.(emailId);
  };

  const handleEmailSelect = (emailId: string, selected: boolean) => {
    if (selected) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };

  return (
    <div className="email-list flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search encrypted emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button size="sm" variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-4 h-4"
              checked={selectedEmails.length === emails.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmails(emails.map(email => email.id));
                } else {
                  setSelectedEmails([]);
                }
              }}
            />
            <span className="mono-text-small text-muted-foreground">
              {selectedEmails.length > 0 ? `${selectedEmails.length} selected` : `${emails.length} emails`}
            </span>
          </div>
          
          {selectedEmails.length > 0 && (
            <div className="flex items-center gap-1">
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
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => (
          <div key={email.id}>
            <div
              className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                selectedEmailId === email.id ? 'bg-muted' : ''
              } ${!email.isRead ? 'border-l-2 border-primary' : ''}`}
              onClick={() => handleEmailClick(email.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1"
                  checked={selectedEmails.includes(email.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleEmailSelect(email.id, e.target.checked);
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`mono-text truncate ${!email.isRead ? 'font-bold' : ''}`}>
                        {truncateAddress(email.from)}
                      </span>
                      {email.isEncrypted && (
                        <Shield className="w-3 h-3 text-green-600" />
                      )}
                      {email.hasAttachments && (
                        <Paperclip className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="mono-text-small text-muted-foreground">
                        {email.timestamp}
                      </span>
                      {email.isStarred && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className={`mono-text mb-1 truncate ${!email.isRead ? 'font-bold' : ''}`}>
                    {email.subject}
                  </h3>
                  
                  <p className="mono-text-small text-muted-foreground line-clamp-2 mb-2">
                    {email.preview}
                  </p>
                  
                  {email.labels.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {email.labels.map((label) => (
                        <Badge key={label} variant="outline" className="mono-text-small px-2 py-0">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Separator />
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between mono-text-small text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last sync: 1m ago</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}