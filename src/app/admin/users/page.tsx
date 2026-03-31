'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useDeleteUser } from '../../../hooks/useDeleteUser';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useClerk();
  const { deleteUser, loading: isDeleting } = useDeleteUser();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await session?.getToken();
      if (!token) return;

      const res = await fetch('http://localhost:3001/api/v1/users?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  const handleDelete = async (id: number, email: string) => {
    const confirm = window.confirm(`Bạn có CHẮC CHẮN muốn xóa người dùng [${email}] không?\n\nHành động này sẽ xóa dữ liệu trên Clerk và hệ thống, KHÔNG THỂ HỒN TÁC!`);
    if (!confirm) return;

    try {
      await deleteUser(id);
      alert('Đã xóa người dùng thành công!');
      fetchUsers(); // Tải lại danh sách
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Quản trị Người dùng</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600">ID</th>
                  <th className="p-4 font-semibold text-gray-600">Họ và Tên</th>
                  <th className="p-4 font-semibold text-gray-600">Email</th>
                  <th className="p-4 font-semibold text-gray-600">Vai trò</th>
                  <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-gray-500 font-mono text-sm">{u.id}</td>
                    <td className="p-4 font-medium text-gray-800">{u.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'STUDENT' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role || 'Chưa phân quyền'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                        u.status === 'BANNED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center">
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={isDeleting}
                        className="px-4 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {isDeleting ? 'Đang xóa...' : 'Xóa Cứng'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      Hệ thống chưa có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
