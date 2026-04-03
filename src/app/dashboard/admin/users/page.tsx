'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAdminUsers, AdminUser } from '@/hooks/useAdminUsers';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { users, total, loading, error, fetchUsers, updateStatus, updateRole } = useAdminUsers();

  useEffect(() => {
    fetchUsers({ page, limit: 10, role: roleFilter, status: statusFilter, search });
  }, [page, roleFilter, statusFilter, fetchUsers]); // search sẽ trigger qua nút "Tìm"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // reset về trang 1
    fetchUsers({ page: 1, limit: 10, role: roleFilter, status: statusFilter, search });
  };

  const handleChangeStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (confirm(`Bạn có chắc muốn đổi trạng thái người dùng thành ${newStatus}?`)) {
        try {
            await updateStatus(id, newStatus);
        } catch (err: any) {
            alert(err.message);
        }
    }
  };

  return (
    <MainLayout role="ADMIN">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            <p className="text-gray-500 text-sm mt-1">Tổng cộng {total} tài khoản trong hệ thống</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100 flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">TÌM KIẾM THEO EMAIL</label>
            <div className="flex">
              <input
                type="text"
                placeholder="Nhập email..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-l-md text-sm outline-none focus:border-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-purple-700">
                Lọc
              </button>
            </div>
          </form>

          <div className="w-48">
             <label className="block text-xs font-semibold text-gray-500 mb-1">VAI TRÒ</label>
             <select 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              >
                <option value="">Tất cả vai trò</option>
                <option value="STUDENT">Học viên</option>
                <option value="INSTRUCTOR">Giảng viên</option>
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Quản trị viên</option>
             </select>
          </div>

          <div className="w-48">
             <label className="block text-xs font-semibold text-gray-500 mb-1">TRẠNG THÁI</label>
             <select 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="SUSPENDED">Tạm khóa</option>
                <option value="BANNED">Cấm vĩnh viễn</option>
             </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex justify-center flex-col items-center">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                          {/* Placeholder avatar or initial */}
                          {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Chưa cập nhật tên'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                        ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'STAFF' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          user.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'}
                      `}>
                        {user.status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleChangeStatus(user.id, user.status)}
                        className={`${user.status === 'ACTIVE' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} mr-4`}
                      >
                        {user.status === 'ACTIVE' ? 'Đình chỉ' : 'Mở khoá'}
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        Sửa role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(page - 1) * 10 + 1}</span> đến <span className="font-medium">{Math.min(page * 10, total)}</span> trong <span className="font-medium">{total}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 10 >= total}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}