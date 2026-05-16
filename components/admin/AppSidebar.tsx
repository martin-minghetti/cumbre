// components/admin/AppSidebar.tsx
'use client';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Beer,
  FlaskConical,
  Wheat,
  Truck,
  ShoppingCart,
  ReceiptText,
  BarChart3,
  Factory,
  Banknote,
  Wallet,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: ('owner' | 'cashier')[];
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operaciones',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner'] },
      { href: '/admin/ventas', label: 'Ventas', icon: ReceiptText, roles: ['owner'] },
      { href: '/admin/produccion', label: 'Produccion', icon: Factory, roles: ['owner'] },
      { href: '/admin/compras', label: 'Compras', icon: ShoppingCart, roles: ['owner'] },
    ],
  },
  {
    label: 'Caja',
    items: [
      { href: '/admin/pos', label: 'POS', icon: Banknote, roles: ['owner', 'cashier'] },
      { href: '/admin/caja', label: 'Caja', icon: Wallet, roles: ['owner', 'cashier'] },
    ],
  },
  {
    label: 'Catalogo',
    items: [
      { href: '/admin/productos', label: 'Productos', icon: Beer, roles: ['owner'] },
      { href: '/admin/batches', label: 'Batches', icon: FlaskConical, roles: ['owner'] },
      { href: '/admin/insumos', label: 'Insumos', icon: Wheat, roles: ['owner'] },
      { href: '/admin/proveedores', label: 'Proveedores', icon: Truck, roles: ['owner'] },
    ],
  },
  {
    label: 'Analisis',
    items: [{ href: '/admin/reportes', label: 'Reportes', icon: BarChart3, roles: ['owner'] }],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname.startsWith(href);
}

export function AppSidebar({ userRole }: { userRole: 'owner' | 'cashier' }) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/60 pb-4">
        <Link href={'/admin' as Route} className="block px-3 pt-3 leading-none">
          <span className="font-display text-3xl uppercase tracking-tight text-sidebar-foreground">
            Cumbre
          </span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-sidebar-primary mt-1">
            Admin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {GROUPS.map((group) => {
          const visibleItems = group.items.filter((i) => i.roles.includes(userRole));
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/50">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={
                            active
                              ? 'relative bg-sidebar-accent/60 text-sidebar-primary font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-sidebar-primary before:rounded-r-sm'
                              : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
                          }
                        >
                          <Link href={item.href as Route}>
                            <Icon className={'size-4 ' + (active ? 'text-sidebar-primary' : '')} />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
