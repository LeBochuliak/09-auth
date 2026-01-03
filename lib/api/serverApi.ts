import { cookies } from 'next/headers';
import { nextServer } from './api';
import { User } from '@/types/user';
import { Note } from '@/types/note'
import { FetchNotesProps, FetchNotesResponse } from './clientApi'

export async function checkServerSession() {
  const cookieStore = await cookies();
  const response = await nextServer.get('/auth/session', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
    
  return response;
};

export async function getServerMe(): Promise<User> {
  const cookieStore = await cookies();
  const { data } = await nextServer.get('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return data;
};

export async function fetchServerNotes({ search, page, tag }: FetchNotesProps): Promise<FetchNotesResponse>{ 
  const cookieStore = await cookies();
    const perPage: number = 12;
    const response = await nextServer.get<FetchNotesResponse>(
        '/notes',
        {
            params: {
                search,   
                page,
                perPage,
                tag,
          },
          headers: {
            Cookie: cookieStore.toString(),
          },
        }
    );
    
    return response.data;
};

export async function fetchServerNoteById(id: string): Promise<Note> {
  const cookieStore = await cookies();
    const response = await nextServer.get<Note>(
      `/notes/${id}`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
  }
    );
    
    return response.data;
}
