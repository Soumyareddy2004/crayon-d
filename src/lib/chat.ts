import { supabase } from './supabase';
import { Message } from '../types/chat';

export async function saveMessage(message: Omit<Message, 'id'>, userId: string) {
  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      user_id: userId,
      role: message.role,
      content: message.content,
      created_at: message.createdAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSimilarMessages(query: string, userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}