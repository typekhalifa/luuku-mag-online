import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ArticleSchedulerProps {
  articleId: string;
  onScheduled?: () => void;
}

const ArticleScheduler: React.FC<ArticleSchedulerProps> = ({ articleId, onScheduled }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDateTime = new Date(date);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Update article with scheduled publish time
      const { error } = await supabase
        .from("articles")
        .update({ 
          published_at: scheduledDateTime.toISOString(),
          featured: false // Remove from immediate publishing
        })
        .eq("id", articleId);

      if (error) throw error;

      toast({
        title: "Article Scheduled",
        description: `Article scheduled for ${format(scheduledDateTime, "PPP 'at' p")}`,
      });

      setOpen(false);
      onScheduled?.();
    } catch (error) {
      console.error("Error scheduling article:", error);
      toast({
        title: "Error",
        description: "Failed to schedule article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Publish Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          <div>
            <Label htmlFor="time">Publish Time</Label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSchedule} 
              disabled={loading || !date || !time}
              className="flex-1"
            >
              {loading ? "Scheduling..." : "Schedule Article"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleScheduler;