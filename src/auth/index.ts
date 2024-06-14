import { useMutation, useQuery } from "@tanstack/react-query"

export interface IStatus {
  status: boolean
}

export interface IUserMetadata {
  admin?: boolean;
  total?: number;
  used?: number;
}

export interface IAuthUser {
  avatar: string;
  email: string;
  has_password: boolean;
  id: number;
  name: string;
  role: 'USER' | 'ADMIN';
  metadata?: IUserMetadata;
}

interface IGetMeResponse {
  status: boolean;
  user?: IAuthUser;
}


export const AUTH_HOST = process.env.NEXT_PUBLIC_AUTH_HOST as string
export const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID as string
export const AUTH_CALLBACK = process.env.NEXT_PUBLIC_AUTH_CALLBACK as string

export class AuthAPI {
  private static async request<T>(path: string, init: RequestInit = {}) {
    const url = new URL(AUTH_HOST + path)

    url.searchParams.set('client_id', CLIENT_ID)

    const response = await fetch(url, {
      ...init,
      credentials: 'include',
    })

    return response.json() as any as T
  }

  static async getMe(session: string) {
    const url = new URL(AUTH_HOST + '/api/user/me');
    url.searchParams.set('client_id', CLIENT_ID);

    const response = await fetch(url, {
      headers: {
        cookie: `session=${session}`,
      },
    });

    const data: IGetMeResponse = await response.json();

    if (!data.status) {
      return false;
    }

    return data.user;
  }

  static async switchUser(id: number) {
    const init = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id })
    }

    return AuthAPI.request<IStatus>('/api/user/switch', init)
  }

  static async logout() {
    const init = {
      method: 'POST',
    }

    return AuthAPI.request<IStatus>('/api/user/logout', init)
  }

  static async me() {
    return AuthAPI.request<{ status: IStatus, user: IAuthUser }>('/api/user/me',)
  }

  static async list() {
    return AuthAPI.request<{ status: IStatus, users: IAuthUser[] }>('/api/user/list')
  }

  public static get loginURL(): string {
    const loginURL = new URL(AUTH_HOST + '/auth/login')
    loginURL.searchParams.append('client_id', CLIENT_ID)
    loginURL.searchParams.append('callback', AUTH_CALLBACK)
    return loginURL.toString()
  }
}

export const useAuthAPIQuery = () => ({
  SwitchUser: () => useMutation({
    mutationFn: async (id: number) => {
      const response = await AuthAPI.switchUser(id)
      if (!response.status)
        throw new Error('An error occured')

      return response.status
    }
  }),
  LogOut: () => useMutation({
    mutationFn: async () => {
      const response = await AuthAPI.logout()
      if (!response.status)
        throw new Error('An error occured')

      return response.status
    }
  }),
  ListUsers: () => useQuery({
    queryKey: ['authAPIQuery.ListUsers'],
    queryFn: async () => (await AuthAPI.list()).users
  }),
  GetMe: () => useQuery({
    queryKey: ['authAPIQuery.GetMe'],
    queryFn: async () => (await AuthAPI.me()).user || null
  }),
})