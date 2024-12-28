import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

export const useLikedSolvers = () => {
  const session = useSession();
  const [likedSolvers, setLikedSolvers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikedSolvers = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('solver_likes')
          .select('solver_id')
          .eq('user_id', session.user.id);

        if (error) throw error;

        setLikedSolvers(data.map(like => like.solver_id));
      } catch (error) {
        console.error('Error fetching liked solvers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedSolvers();
  }, [session?.user]);

  return { likedSolvers, setLikedSolvers, isLoading };
};