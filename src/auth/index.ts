import { useMutation, useQuery } from "@tanstack/react-query"

export interface IStatus {
  status: boolean
}

export interface IUser {
  id: number,
  name: string,
  email: string,
  avatar: string,
  has_password: boolean
}

export class AuthAPI {
  private static async request<T>(path: string, init: RequestInit = {}) {
    const url = new URL(process.env.NEXT_PUBLIC_AUTH_HOST + path).toString()

    const response = await fetch(url, {
      ...init,
      credentials: 'include',
    })

    return response.json() as any as T
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
    return AuthAPI.request<{ status: IStatus, user: IUser }>('/api/user/me')
  }

  static async list() {
    return AuthAPI.request<{ status: IStatus, users: IUser[] }>('/api/user/list')
  }

  static loginURL = new URL(process.env.NEXT_PUBLIC_AUTH_HOST + '/auth/login').toString()
}

export const useAuthAPIQuery = () => ({
  SwitchUser: () => useMutation({
    mutationFn: async (id: number) => (await AuthAPI.switchUser(id)).status
  }),
  LogOut: () => useMutation({
    mutationFn: async () => (await AuthAPI.logout()).status
  }),
  ListUsers: () => useQuery({
    queryKey: ['authAPIQuery.ListUsers'],
    queryFn: async () => (await AuthAPI.list()).users
  }),
  GetMe: () => useQuery({
    queryKey: ['authAPIQuery.GetMe'],
    queryFn: async () => (await AuthAPI.me()).user
  }),
})