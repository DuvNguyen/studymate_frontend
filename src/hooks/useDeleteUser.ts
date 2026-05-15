import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useClerk();

  const deleteUser = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await session?.getToken();
      if (!token) throw new Error('Không có quyền truy cập');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Lỗi khi xóa người dùng');
      }

      const { data } = await res.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setLoading(false);
      throw err;
    }
  };

  return { deleteUser, loading, error };
}
