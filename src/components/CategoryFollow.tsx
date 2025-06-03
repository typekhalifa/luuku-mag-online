
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PlusIcon, CheckIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CategoryFollowProps {
  currentCategory?: string;
  onCategoryClick?: (category: string) => void;
}

const CategoryFollow = ({ currentCategory, onCategoryClick }: CategoryFollowProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [followedCategories, setFollowedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get unique categories from articles
        const { data, error } = await supabase
          .from('articles')
          .select('category')
          .not('category', 'is', null);

        if (error) throw error;

        const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
        setCategories(uniqueCategories);

        // Load followed categories from localStorage
        const saved = localStorage.getItem('followedCategories');
        if (saved) {
          setFollowedCategories(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleFollow = (category: string) => {
    const isFollowed = followedCategories.includes(category);
    let newFollowed;
    
    if (isFollowed) {
      newFollowed = followedCategories.filter(c => c !== category);
      toast({
        title: "Unfollowed",
        description: `You've unfollowed ${category} articles`,
      });
    } else {
      newFollowed = [...followedCategories, category];
      toast({
        title: "Following",
        description: `You're now following ${category} articles`,
      });
    }
    
    setFollowedCategories(newFollowed);
    localStorage.setItem('followedCategories', JSON.stringify(newFollowed));
  };

  if (loading || categories.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">Follow Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const isFollowed = followedCategories.includes(category);
          const isCurrent = category === currentCategory;
          
          return (
            <div key={category} className="flex items-center justify-between">
              <Badge
                variant={isCurrent ? "default" : "outline"}
                className={`cursor-pointer ${isCurrent ? 'bg-highlight' : ''}`}
                onClick={() => onCategoryClick?.(category)}
              >
                {category}
              </Badge>
              <Button
                variant={isFollowed ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFollow(category)}
                className="ml-2"
              >
                {isFollowed ? (
                  <>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
      {followedCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            You're following {followedCategories.length} categories
          </p>
        </div>
      )}
    </Card>
  );
};

export default CategoryFollow;
