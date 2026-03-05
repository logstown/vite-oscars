import { Link } from '@heroui/link'
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
} from '@heroui/navbar'
import { AuthContext } from '@/config/auth-provider'
import UserMenu from './user-menu'
import { useContext, useState } from 'react'
import Ballot from './ballot'
import { ThemeSwitch } from './theme-switch'
import { TrophyIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export const Navbar = () => {
  const { currentUser } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    {
      label: 'Pools',
      url: '/',
    },
    {
      label: 'Hall of Fame',
      url: '/hall-of-fame',
    },
    {
      label: 'Oscar History',
      url: '/history',
    },
  ]

  return (
    <NextUINavbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className='sm:hidden' justify='start'>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className='sm:hidden pr-3'>
        <NavbarBrand>
          <Link
            className='flex justify-start items-center gap-3 cursor-pointer'
            color='foreground'
            onPress={() => navigate('/')}
          >
            <p className='font-bold text-inherit'>Oscar Showdown</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        <NavbarBrand className='pr-6'>
          <Link
            className='flex justify-start items-center gap-3 cursor-pointer'
            color='foreground'
            onPress={() => navigate('/')}
          >
            <p className='font-bold text-inherit'>Oscar Showdown</p>
          </Link>
        </NavbarBrand>
        {menuItems.map(item => (
          <NavbarItem key={item.url} isActive={pathname === item.url}>
            <Link
              className='cursor-pointer'
              color={pathname === item.url ? 'primary' : 'foreground'}
              onPress={() => navigate(item.url)}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      {currentUser && (
        <NavbarContent as='div' justify='end'>
          <ThemeSwitch />
          <UserMenu currentUser={currentUser} />
        </NavbarContent>
      )}
      <NavbarMenu>
        {menuItems.map(item => (
          <NavbarMenuItem key={item.url}>
            <Link
              title={item.label}
              className='w-full cursor-pointer'
              color='foreground'
              size='lg'
              onPress={() => {
                navigate(item.url)
                setIsMenuOpen(false)
              }}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextUINavbar>
  )
}
