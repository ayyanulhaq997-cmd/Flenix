import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, Trash2, FileText, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface File {
  id: number;
  storageKey: string;
  originalName: string;
  ownerUserId: string;
  mimeType?: string;
  fileSizeBytes?: number;
  uploadedAt: string;
  status: string;
}

export default function Files() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch files');
      return response.json();
    },
  });

  // Download file mutation
  const downloadMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to generate download link');
      return response.json();
    },
    onSuccess: (data) => {
      // Open the signed URL in a new tab or trigger download
      window.location.href = data.signedUrl;
      toast({
        title: "Download Started",
        description: `${data.fileName} is downloading...`,
        className: "bg-green-600 border-green-700 text-white",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete file');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: "File Deleted",
        description: "The file has been removed.",
        className: "bg-green-600 border-green-700 text-white",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = (fileId: number) => {
    downloadMutation.mutate(fileId);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteFileMutation.mutate(id);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "processing":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "deleted":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Files Library</h1>
          <p className="text-muted-foreground">
            Manage your uploaded content. {files.length} file{files.length !== 1 ? 's' : ''} available.
          </p>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No files uploaded yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload files through the API to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold">File Name</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Size</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Uploaded</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file: File) => (
                  <TableRow 
                    key={file.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`row-file-${file.id}`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-white font-medium" data-testid={`text-filename-${file.id}`}>
                          {file.originalName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <HardDrive className="w-4 h-4" />
                        <span data-testid={`text-filesize-${file.id}`}>
                          {formatFileSize(file.fileSizeBytes)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground text-sm">
                      {file.mimeType || "unknown"}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground text-sm">
                      {formatDate(file.uploadedAt)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(file.status)}`}
                        data-testid={`badge-status-${file.id}`}
                      >
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-white/10"
                            data-testid={`button-menu-${file.id}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.5 1.5H9.5V3.5H10.5V1.5ZM10.5 8.5H9.5V16.5H10.5V8.5ZM10.5 5H9.5V6.5H10.5V5Z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-card border border-white/10"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => handleDownload(file.id)}
                            className="cursor-pointer hover:bg-white/5"
                            data-testid={`button-download-${file.id}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(file.id)}
                            className="cursor-pointer hover:bg-red-500/10 text-red-400"
                            data-testid={`button-delete-${file.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
