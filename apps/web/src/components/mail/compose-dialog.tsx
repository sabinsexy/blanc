import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Paperclip,
  Smile,
  Type,
  Shield,
  X,
  Plus,
  Eye,
  EyeOff,
  Clock,
  Zap
} from 'lucide-react';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    subject: string;
    to: string;
    messageId: string;
  };
}

export function ComposeDialog({ open, onOpenChange, replyTo }: ComposeDialogProps) {
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);

  const handleSend = async () => {
    setIsEncrypting(true);
    
    // Simulate encryption process
    setTimeout(() => {
      console.log('Sending encrypted email:', {
        to,
        cc,
        bcc,
        subject,
        body,
        attachments: attachments.length
      });
      setIsEncrypting(false);
      onOpenChange(false);
    }, 1500);
  };

  const handleAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="mono-title text-lg">
              {replyTo ? 'Reply' : 'Compose'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEncryptionDetails(!showEncryptionDetails)}
              >
                <Shield className="w-4 h-4 text-green-600" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-6">
          {/* Encryption Details */}
          {showEncryptionDetails && (
            <div className="mb-4 p-3 bg-muted/50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="mono-text-small font-medium text-green-600">
                  End-to-End Encryption Enabled
                </span>
              </div>
              <div className="space-y-1 mono-text-small text-muted-foreground">
                <p>• Message will be encrypted with TweetNaCl.js</p>
                <p>• Unique session key generated per email</p>
                <p>• Keys derived from your wallet signature</p>
                <p>• Only recipients can decrypt content</p>
              </div>
            </div>
          )}

          {/* Recipients */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <label className="mono-text-small font-medium w-12">To:</label>
              <div className="flex-1">
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="vitalik.eth, 0x742d35Cc..."
                  className="mono-input"
                />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCc(!showCc)}
                  className={showCc ? 'bg-muted' : ''}
                >
                  Cc
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowBcc(!showBcc)}
                  className={showBcc ? 'bg-muted' : ''}
                >
                  Bcc
                </Button>
              </div>
            </div>

            {showCc && (
              <div className="flex items-center gap-3">
                <label className="mono-text-small font-medium w-12">Cc:</label>
                <Input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Additional recipients..."
                  className="flex-1"
                />
              </div>
            )}

            {showBcc && (
              <div className="flex items-center gap-3">
                <label className="mono-text-small font-medium w-12">Bcc:</label>
                <Input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Hidden recipients..."
                  className="flex-1"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="mono-text-small font-medium w-12">Subject:</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="flex-1"
              />
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4" />
                <span className="mono-text-small font-medium">
                  {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="mono-text-small">{file.name}</span>
                      <Badge variant="outline" className="mono-text-small">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {/* Body */}
          <div className="flex-1 flex flex-col mb-4">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your encrypted message..."
              className="flex-1 min-h-[300px] resize-none font-mono"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="relative">
                <Paperclip className="w-4 h-4 mr-1" />
                Attach
                <input
                  type="file"
                  multiple
                  onChange={handleAttachment}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </Button>
              
              <Button size="sm" variant="ghost">
                <Type className="w-4 h-4" />
              </Button>
              
              <Button size="sm" variant="ghost">
                <Smile className="w-4 h-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <div className="flex items-center gap-1 mono-text-small text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Auto-save</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mono-text-small text-green-600">
                <Shield className="w-3 h-3" />
                <span>Encrypted</span>
              </div>
              
              <Button
                onClick={handleSend}
                disabled={!to || !subject || isEncrypting}
                className="primary"
              >
                {isEncrypting ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}