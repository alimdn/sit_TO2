'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  X,
  Download,
  FolderOpen,
  FileCode2,
  FileJson,
  FileType,
  Image,
  ChevronRight,
  ChevronDown,
  Folder,
  Loader2,
  Package,
  Server,
  Layout,
  Database,
} from 'lucide-react'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  size?: number
  ext?: string
}

const FILE_ICONS: Record<string, typeof FileCode2> = {
  '.ts': FileCode2,
  '.tsx': FileCode2,
  '.js': FileCode2,
  '.jsx': FileCode2,
  '.json': FileJson,
  '.css': FileType,
  '.prisma': Database,
  '.md': FileType,
  '.png': Image,
  '.jpg': Image,
  '.svg': Image,
  '.ico': Image,
}

function getFileIcon(name: string) {
  const ext = name.substring(name.lastIndexOf('.'))
  return FILE_ICONS[ext] || FileCode2
}

const DOWNLOAD_PACKAGES = [
  {
    id: 'project',
    label: 'Full Project',
    description: 'Entire project source code (excludes node_modules)',
    icon: Package,
    color: '#000f22',
  },
  {
    id: 'src',
    label: 'Source Code',
    description: 'src/ directory with all components and pages',
    icon: FileCode2,
    color: '#0A2540',
  },
  {
    id: 'components',
    label: 'Components',
    description: 'All UI components (header, templates, admin, etc.)',
    icon: Layout,
    color: '#10B981',
  },
  {
    id: 'api',
    label: 'API Routes',
    description: 'All backend API endpoints',
    icon: Server,
    color: '#F59E0B',
  },
]

export default function ProjectFilesModal() {
  const { showProjectFiles, setShowProjectFiles } = useAppStore()
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src', 'src/app', 'src/components', 'src/lib']))
  const [downloading, setDownloading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tree' | 'download'>('download')

  // Build file tree from known structure
  useEffect(() => {
    const tree: FileNode[] = [
      {
        name: 'src',
        type: 'folder',
        path: 'src',
        children: [
          {
            name: 'app',
            type: 'folder',
            path: 'src/app',
            children: [
              {
                name: 'api',
                type: 'folder',
                path: 'src/app/api',
                children: [
                  { name: 'route.ts', type: 'file', path: 'src/app/api/route.ts', ext: '.ts' },
                  {
                    name: 'admin',
                    type: 'folder',
                    path: 'src/app/api/admin',
                    children: [
                      { name: 'stats', type: 'folder', path: 'src/app/api/admin/stats', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/admin/stats/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'auth',
                    type: 'folder',
                    path: 'src/app/api/auth',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/auth/route.ts', ext: '.ts' },
                      { name: 'register', type: 'folder', path: 'src/app/api/auth/register', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/auth/register/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'contact',
                    type: 'folder',
                    path: 'src/app/api/contact',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/contact/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/contact/[id]', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/contact/[id]/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'download',
                    type: 'folder',
                    path: 'src/app/api/download',
                    children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/download/route.ts', ext: '.ts' }],
                  },
                  {
                    name: 'faqs',
                    type: 'folder',
                    path: 'src/app/api/faqs',
                    children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/faqs/route.ts', ext: '.ts' }],
                  },
                  {
                    name: 'orders',
                    type: 'folder',
                    path: 'src/app/api/orders',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/orders/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/orders/[id]', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/orders/[id]/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'payment-gateways',
                    type: 'folder',
                    path: 'src/app/api/payment-gateways',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/payment-gateways/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/payment-gateways/[id]', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/payment-gateways/[id]/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'plans',
                    type: 'folder',
                    path: 'src/app/api/plans',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/plans/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/plans/[id]', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/plans/[id]/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'settings',
                    type: 'folder',
                    path: 'src/app/api/settings',
                    children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/settings/route.ts', ext: '.ts' }],
                  },
                  {
                    name: 'social',
                    type: 'folder',
                    path: 'src/app/api/social',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/social/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/social/[id]', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/social/[id]/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'subscriptions',
                    type: 'folder',
                    path: 'src/app/api/subscriptions',
                    children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/subscriptions/route.ts', ext: '.ts' }],
                  },
                  {
                    name: 'support',
                    type: 'folder',
                    path: 'src/app/api/support',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/support/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/support/[id]', children: [
                        { name: 'route.ts', type: 'file', path: 'src/app/api/support/[id]/route.ts', ext: '.ts' },
                        { name: 'messages', type: 'folder', path: 'src/app/api/support/[id]/messages', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/support/[id]/messages/route.ts', ext: '.ts' }] },
                      ] },
                    ],
                  },
                  {
                    name: 'templates',
                    type: 'folder',
                    path: 'src/app/api/templates',
                    children: [
                      { name: 'route.ts', type: 'file', path: 'src/app/api/templates/route.ts', ext: '.ts' },
                      { name: '[id]', type: 'folder', path: 'src/app/api/templates/[id]', children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/templates/[id]/route.ts', ext: '.ts' }] },
                    ],
                  },
                  {
                    name: 'testimonials',
                    type: 'folder',
                    path: 'src/app/api/testimonials',
                    children: [{ name: 'route.ts', type: 'file', path: 'src/app/api/testimonials/route.ts', ext: '.ts' }],
                  },
                ],
              },
              { name: 'layout.tsx', type: 'file', path: 'src/app/layout.tsx', ext: '.tsx' },
              { name: 'page.tsx', type: 'file', path: 'src/app/page.tsx', ext: '.tsx' },
              { name: 'globals.css', type: 'file', path: 'src/app/globals.css', ext: '.css' },
            ],
          },
          {
            name: 'components',
            type: 'folder',
            path: 'src/components',
            children: [
              { name: 'Header.tsx', type: 'file', path: 'src/components/Header.tsx', ext: '.tsx' },
              { name: 'Footer.tsx', type: 'file', path: 'src/components/Footer.tsx', ext: '.tsx' },
              { name: 'ProjectFilesModal.tsx', type: 'file', path: 'src/components/ProjectFilesModal.tsx', ext: '.tsx' },
              {
                name: 'admin',
                type: 'folder',
                path: 'src/components/admin',
                children: [
                  { name: 'AdminSidebar.tsx', type: 'file', path: 'src/components/admin/AdminSidebar.tsx', ext: '.tsx' },
                  { name: 'AdminTemplates.tsx', type: 'file', path: 'src/components/admin/AdminTemplates.tsx', ext: '.tsx' },
                  { name: 'AdminPlans.tsx', type: 'file', path: 'src/components/admin/AdminPlans.tsx', ext: '.tsx' },
                  { name: 'AdminOrders.tsx', type: 'file', path: 'src/components/admin/AdminOrders.tsx', ext: '.tsx' },
                  { name: 'AdminMessages.tsx', type: 'file', path: 'src/components/admin/AdminMessages.tsx', ext: '.tsx' },
                  { name: 'AdminSocial.tsx', type: 'file', path: 'src/components/admin/AdminSocial.tsx', ext: '.tsx' },
                  { name: 'AdminPayments.tsx', type: 'file', path: 'src/components/admin/AdminPayments.tsx', ext: '.tsx' },
                  { name: 'AdminSettings.tsx', type: 'file', path: 'src/components/admin/AdminSettings.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'auth',
                type: 'folder',
                path: 'src/components/auth',
                children: [
                  { name: 'LoginForm.tsx', type: 'file', path: 'src/components/auth/LoginForm.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'checkout',
                type: 'folder',
                path: 'src/components/checkout',
                children: [
                  { name: 'CheckoutPage.tsx', type: 'file', path: 'src/components/checkout/CheckoutPage.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'contact',
                type: 'folder',
                path: 'src/components/contact',
                children: [
                  { name: 'ContactForm.tsx', type: 'file', path: 'src/components/contact/ContactForm.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'dashboard',
                type: 'folder',
                path: 'src/components/dashboard',
                children: [
                  { name: 'DashboardSidebar.tsx', type: 'file', path: 'src/components/dashboard/DashboardSidebar.tsx', ext: '.tsx' },
                  { name: 'DashboardOverview.tsx', type: 'file', path: 'src/components/dashboard/DashboardOverview.tsx', ext: '.tsx' },
                  { name: 'OrdersPage.tsx', type: 'file', path: 'src/components/dashboard/OrdersPage.tsx', ext: '.tsx' },
                  { name: 'SupportCenter.tsx', type: 'file', path: 'src/components/dashboard/SupportCenter.tsx', ext: '.tsx' },
                  { name: 'DashboardSettings.tsx', type: 'file', path: 'src/components/dashboard/DashboardSettings.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'home',
                type: 'folder',
                path: 'src/components/home',
                children: [
                  { name: 'HeroSection.tsx', type: 'file', path: 'src/components/home/HeroSection.tsx', ext: '.tsx' },
                  { name: 'FeaturesSection.tsx', type: 'file', path: 'src/components/home/FeaturesSection.tsx', ext: '.tsx' },
                  { name: 'HowItWorksSection.tsx', type: 'file', path: 'src/components/home/HowItWorksSection.tsx', ext: '.tsx' },
                  { name: 'TestimonialsSection.tsx', type: 'file', path: 'src/components/home/TestimonialsSection.tsx', ext: '.tsx' },
                  { name: 'FAQSection.tsx', type: 'file', path: 'src/components/home/FAQSection.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'plans',
                type: 'folder',
                path: 'src/components/plans',
                children: [
                  { name: 'PlansPage.tsx', type: 'file', path: 'src/components/plans/PlansPage.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'templates',
                type: 'folder',
                path: 'src/components/templates',
                children: [
                  { name: 'TemplateGrid.tsx', type: 'file', path: 'src/components/templates/TemplateGrid.tsx', ext: '.tsx' },
                  { name: 'TemplateCard.tsx', type: 'file', path: 'src/components/templates/TemplateCard.tsx', ext: '.tsx' },
                  { name: 'TemplatePreview.tsx', type: 'file', path: 'src/components/templates/TemplatePreview.tsx', ext: '.tsx' },
                ],
              },
              {
                name: 'ui',
                type: 'folder',
                path: 'src/components/ui',
                children: [
                  { name: 'button.tsx', type: 'file', path: 'src/components/ui/button.tsx', ext: '.tsx' },
                  { name: 'badge.tsx', type: 'file', path: 'src/components/ui/badge.tsx', ext: '.tsx' },
                  { name: 'input.tsx', type: 'file', path: 'src/components/ui/input.tsx', ext: '.tsx' },
                  { name: 'label.tsx', type: 'file', path: 'src/components/ui/label.tsx', ext: '.tsx' },
                  { name: 'textarea.tsx', type: 'file', path: 'src/components/ui/textarea.tsx', ext: '.tsx' },
                  { name: 'sheet.tsx', type: 'file', path: 'src/components/ui/sheet.tsx', ext: '.tsx' },
                  { name: 'dropdown-menu.tsx', type: 'file', path: 'src/components/ui/dropdown-menu.tsx', ext: '.tsx' },
                  { name: 'avatar.tsx', type: 'file', path: 'src/components/ui/avatar.tsx', ext: '.tsx' },
                  { name: 'dialog.tsx', type: 'file', path: 'src/components/ui/dialog.tsx', ext: '.tsx' },
                ],
              },
            ],
          },
          {
            name: 'hooks',
            type: 'folder',
            path: 'src/hooks',
            children: [
              { name: 'use-mobile.ts', type: 'file', path: 'src/hooks/use-mobile.ts', ext: '.ts' },
            ],
          },
          {
            name: 'lib',
            type: 'folder',
            path: 'src/lib',
            children: [
              { name: 'store.ts', type: 'file', path: 'src/lib/store.ts', ext: '.ts' },
              { name: 'prisma.ts', type: 'file', path: 'src/lib/prisma.ts', ext: '.ts' },
              { name: 'utils.ts', type: 'file', path: 'src/lib/utils.ts', ext: '.ts' },
            ],
          },
        ],
      },
      {
        name: 'prisma',
        type: 'folder',
        path: 'prisma',
        children: [
          { name: 'schema.prisma', type: 'file', path: 'prisma/schema.prisma', ext: '.prisma' },
          { name: 'seed.ts', type: 'file', path: 'prisma/seed.ts', ext: '.ts' },
        ],
      },
      { name: 'package.json', type: 'file', path: 'package.json', ext: '.json' },
      { name: 'tsconfig.json', type: 'file', path: 'tsconfig.json', ext: '.json' },
      { name: 'next.config.ts', type: 'file', path: 'next.config.ts', ext: '.ts' },
      { name: 'tailwind.config.ts', type: 'file', path: 'tailwind.config.ts', ext: '.ts' },
      { name: 'postcss.config.mjs', type: 'file', path: 'postcss.config.mjs', ext: '.mjs' },
    ]
    setFileTree(tree)
  }, [])

  const toggleExpand = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const handleDownload = async (target: string) => {
    setDownloading(target)
    try {
      const res = await fetch(`/api/download?target=${target}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition')
      const filename = disposition
        ? disposition.split('filename=')[1]?.replace(/"/g, '')
        : `${target}.zip`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(null)
    }
  }

  const countFiles = useCallback((nodes: FileNode[]): number => {
    let count = 0
    for (const node of nodes) {
      if (node.type === 'file') count++
      if (node.children) count += countFiles(node.children)
    }
    return count
  }, [])

  if (!showProjectFiles) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowProjectFiles(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e6ebf1]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6ebf1] bg-[#f7fafd]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#000f22] flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-[#00D1FF]" />
            </div>
            <div>
              <h2 className="font-bold text-[#000f22] text-lg">Project Files</h2>
              <p className="text-xs text-[#4F5B76]">Browse & download website source files</p>
            </div>
          </div>
          <button
            onClick={() => setShowProjectFiles(false)}
            className="w-8 h-8 rounded-lg hover:bg-[#e6ebf1] flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-[#43474d]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e6ebf1]">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'download'
                ? 'border-[#00D1FF] text-[#000f22]'
                : 'border-transparent text-[#4F5B76] hover:text-[#000f22]'
            }`}
          >
            <Download className="h-4 w-4" />
            Download Packages
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tree'
                ? 'border-[#00D1FF] text-[#000f22]'
                : 'border-transparent text-[#4F5B76] hover:text-[#000f22]'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            File Explorer
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'download' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#4F5B76] mb-4">
                Select a package to download. Each package contains the relevant source files for your project.
              </p>
              {DOWNLOAD_PACKAGES.map((pkg) => {
                const Icon = pkg.icon
                const isDownloading = downloading === pkg.id
                return (
                  <div
                    key={pkg.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#e6ebf1] hover:border-[#c4c6ce] transition-all bg-white group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: pkg.color + '10' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: pkg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#000f22] text-sm">{pkg.label}</h3>
                      <p className="text-xs text-[#4F5B76] mt-0.5">{pkg.description}</p>
                    </div>
                    <Button
                      onClick={() => handleDownload(pkg.id)}
                      disabled={isDownloading}
                      className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9 text-xs px-4 flex-shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Zipping...
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download ZIP
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-sm text-[#4F5B76] mb-4">
                {countFiles(fileTree)} files in the project. Switch to Download Packages tab to get the ZIP files.
              </p>
              {fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e6ebf1] bg-[#f7fafd] flex items-center justify-between">
          <span className="text-xs text-[#74777e]">
            WebFlowSub — Next.js 16 Project
          </span>
          <Button
            onClick={() => handleDownload('project')}
            disabled={downloading === 'project'}
            className="bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-9 text-xs"
          >
            {downloading === 'project' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Full Project
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FileTreeNode({
  node,
  expanded,
  onToggle,
  depth,
}: {
  node: FileNode
  expanded: Set<string>
  onToggle: (path: string) => void
  depth: number
}) {
  const isExpanded = expanded.has(node.path)
  const isFolder = node.type === 'folder'

  if (isFolder) {
    return (
      <div>
        <button
          onClick={() => onToggle(node.path)}
          className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#f1f4f7] transition-colors text-left group"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#74777e] flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[#74777e] flex-shrink-0" />
          )}
          <Folder className="h-4 w-4 text-[#F59E0B] flex-shrink-0" />
          <span className="text-sm font-medium text-[#000f22] group-hover:text-[#0A2540]">
            {node.name}
          </span>
          {node.children && (
            <span className="text-[10px] text-[#74777e] ml-auto">
              {node.children.length} items
            </span>
          )}
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                expanded={expanded}
                onToggle={onToggle}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const Icon = getFileIcon(node.name)

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#f7fafd] transition-colors"
      style={{ paddingLeft: `${depth * 20 + 20 + 8}px` }}
    >
      <Icon className="h-3.5 w-3.5 text-[#4F5B76] flex-shrink-0" />
      <span className="text-sm text-[#43474d]">{node.name}</span>
      <span className="text-[10px] text-[#74777e] ml-auto font-mono">{node.ext}</span>
    </div>
  )
}
