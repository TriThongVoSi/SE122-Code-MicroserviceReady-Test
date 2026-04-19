import { mockUsers } from '@/src/shared/api/mock';
import { Badge } from '@/src/shared/ui/Badge';

export function AdminUsers() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Số điện thoại</th>
                <th className="p-4 font-medium">Vai trò</th>
                <th className="p-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600">{user.phone || '-'}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'seller' ? 'warning' : 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="success">Hoạt động</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
