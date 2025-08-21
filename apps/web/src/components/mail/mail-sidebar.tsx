import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Inbox, 
  Send, 
  FileText, 
  Trash2, 
  Plus, 
  Settings, 
  User,
  Star,
  Archive,
  Tag,
  Clock
} from 'lucide-react';

interface MailSidebarProps {
  walletAddress?: string;
  onLogout?: () => void;
  onCompose?: () => void;
}

export function MailSidebar({ walletAddress, onLogout, onCompose }: MailSidebarProps) {
  const [selectedFolder, setSelectedFolder] = useState('inbox');

  const systemFolders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 12 },
    { id: 'starred', name: 'Starred', icon: Star, count: 3 },
    { id: 'sent', name: 'Sent', icon: Send, count: 45 },
    { id: 'drafts', name: 'Drafts', icon: FileText, count: 2 },
    { id: 'archive', name: 'Archive', icon: Archive, count: 156 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 8 },
  ];

  const customFolders = [
    { id: 'work', name: 'Work', icon: Tag, count: 8 },
    { id: 'personal', name: 'Personal', icon: Tag, count: 15 },
    { id: 'newsletters', name: 'Newsletters', icon: Tag, count: 23 },
  ];

  return (
    <div className="sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="mb-4">
          <h1 className="mono-title text-lg font-bold">SKIFF MAIL</h1>
          <p className="mono-text-small text-muted-foreground mt-1 break-all">
            {walletAddress}
          </p>
        </div>
        
        <Button className="w-full mb-3" size="default" onClick={onCompose}>
          <Plus className="w-4 h-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* System Folders */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-1">
            {systemFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left mono-text hover:bg-muted transition-colors ${
                  selectedFolder === folder.id ? 'bg-muted font-medium' : ''
                }`}
              >
                <div className="flex items-center">
                  <folder.icon className="w-4 h-4 mr-3" />
                  <span>{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="mono-text-small">
                    {folder.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Custom Folders */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="mono-text-small text-muted-foreground uppercase tracking-wider">
                Labels
              </h3>
              <Button size="sm" variant="ghost" className="p-1 h-auto">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {customFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left mono-text hover:bg-muted transition-colors ${
                    selectedFolder === folder.id ? 'bg-muted font-medium' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary mr-3"></div>
                    <span>{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className="mono-text-small text-muted-foreground">
                      {folder.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Button size="sm" variant="ghost">
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <User className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onLogout}>
            <span className="mono-text-small">Logout</span>
          </Button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mono-text-small text-muted-foreground">
            <span>Storage</span>
            <span>2.1 GB / ∞</span>
          </div>
          <div className="w-full bg-secondary h-1 mt-1">
            <div className="bg-primary h-1 w-[15%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}