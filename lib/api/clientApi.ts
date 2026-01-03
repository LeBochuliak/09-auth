import { nextServer } from './api'
import type { Note, NoteTag } from '../../types/note'
import type { User } from '../../types/user';

export interface FetchNotesResponse {
    notes: Note[];
    totalPages: number;
};

interface CreateNoteProps {
    title: string, 
    content: string | null, 
    tag: NoteTag
}

export interface FetchNotesProps {
    search?: string,
    page: number, 
    tag?: string
}

export interface Register_Login_Request {
    email: string;
    password: string;
}

interface CheckSessionRequest {
  success: boolean;
};

export interface UpdateUserRequest {
  username?: string;
};

export async function fetchNotes({search, page, tag}: FetchNotesProps): Promise<FetchNotesResponse>{ 
    const perPage: number = 12;
    const response = await nextServer.get<FetchNotesResponse>(
        '/notes',
        {
            params: {
                search,   
                page,
                perPage,
                tag,
            }
        }
    );
    
    return response.data;
};

export async function fetchNoteById(id: string): Promise<Note> {
    const response = await nextServer.get<Note>(
      `/notes/${id}`
    );
    
    return response.data;
}

export async function createNote({title, content, tag}: CreateNoteProps): Promise<Note> {
    
    const normalizedContent = content ?? "";

    const response = await nextServer.post<Note>(
      '/notes',
      {
        title,
        content: normalizedContent,
        tag,
      }
    );
    
    return response.data;
}

export async function deleteNote( id : string): Promise<Note> {
    const response = await nextServer.delete<Note>(
      `/notes/${id}`
    );

    return response.data;
};

export async function register(data: Register_Login_Request) {
    const response = await nextServer.post<User>('/auth/register', data);
    return response.data;
}

export async function login(data: Register_Login_Request) {
  const response = await nextServer.post<User>('/auth/login', data);
  return response.data;
};

export async function logout(): Promise<void> {
  await nextServer.post('/auth/logout')
};

export async function checkSession() {
  const response = await nextServer.get<CheckSessionRequest>('/auth/session');
  return response.data.success;
};

export async function getMe() {
  const { data } = await nextServer.get<User>('/users/me');
  return data;
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const response = await nextServer.patch<User>('/users/me', payload);
  return response.data;
};
