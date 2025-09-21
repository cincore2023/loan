'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Sun, Moon, LogOut, User, Settings, Home } from 'lucide-react';

export default function RadixUIDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Radix UI 组件演示</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Button 组件演示 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Button 组件</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>默认按钮</Button>
                <Button variant="secondary">次要按钮</Button>
                <Button variant="destructive">危险按钮</Button>
                <Button variant="outline">轮廓按钮</Button>
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="link">链接按钮</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">小按钮</Button>
                <Button size="default">默认按钮</Button>
                <Button size="lg">大按钮</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button>
                  <Home className="mr-2 h-4 w-4" />
                  带图标按钮
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
              </div>
            </div>
          </div>
          
          {/* Dialog 组件演示 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dialog 组件</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>示例对话框</DialogTitle>
                  <DialogDescription>
                    这是一个使用 Radix UI Dialog 组件创建的对话框示例。
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>对话框内容区域</p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setDialogOpen(false)}>关闭</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Dropdown Menu 组件演示 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dropdown Menu 组件</h2>
            <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <Button>
                  打开菜单 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[220px] bg-white rounded-md shadow-lg p-2 z-50"
                  sideOffset={5}
                >
                  <DropdownMenu.Item className="flex items-center rounded-md px-3 py-2 text-sm outline-none cursor-pointer hover:bg-gray-100">
                    <User className="mr-2 h-4 w-4" />
                    个人资料
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex items-center rounded-md px-3 py-2 text-sm outline-none cursor-pointer hover:bg-gray-100">
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                  <DropdownMenu.Item className="flex items-center rounded-md px-3 py-2 text-sm outline-none cursor-pointer hover:bg-gray-100 text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </div>
  );
}