import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Table,
  Group,
  Button,
  TextInput,
  ActionIcon,
  Badge,
  Paper,
  Modal,
  PasswordInput,
  Switch,
  Text,
  Tabs,
  Box,
  Card,
  Grid,
  useMantineTheme,
  Skeleton,
  Alert,
  Select,
  Tooltip
} from '@mantine/core';
import { 
  IconTrash, 
  IconEdit, 
  IconLock, 
  IconAlertCircle, 
  IconSearch, 
  IconUser, 
  IconUserExclamation, 
  IconUserCheck, 
  IconChartPie, 
  IconRefresh,
  IconCheck,
  IconX,
  IconShieldCheck
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import userService from '../api/userService';
import { useDisclosure } from '@mantine/hooks';

function AdminView() {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModal, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [editModal, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [passwordModal, { open: openPassword, close: closePassword }] = useDisclosure(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    is_active: true,
    is_admin: false
  });
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Update filtered users when search term or active tab changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, activeTab]);

  // Calculate user stats when users change
  useEffect(() => {
    if (users.length > 0) {
      setUserStats({
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        admins: users.filter(u => u.is_admin).length
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t('adminView.errors.loadUsersGeneral'));
      toast.error(t('adminView.toast.loadUsersError'));
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(u => u.is_active);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(u => !u.is_active);
    } else if (activeTab === 'admins') {
      filtered = filtered.filter(u => u.is_admin);
    }
    
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser.id));
      toast.success(t('adminView.toast.userDeletedSuccess', { username: selectedUser.username }));
      closeDelete();
    } catch (err) {
      toast.error(t('adminView.toast.deleteUserError'));
      if (err.response.status === 403) {
        toast.warning(t('adminView.toast.cannotDeleteSelf'));
      }
      console.error('Failed to delete user:', err);
    }
  };

  const handleEditUser = async () => {
    try {
      const updatedUser = await userService.adminUpdateUser(selectedUser.id, editForm);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === selectedUser.id ? updatedUser : u)
      );
      toast.success(t('adminView.toast.userUpdatedSuccess', { username: editForm.username }));
      closeEdit();
    } catch (err) {
      toast.error(t('adminView.toast.updateUserError'));
      console.error('Failed to update user:', err);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await userService.adminChangePassword(selectedUser.id, newPassword);
      toast.success(t('adminView.toast.passwordChangedSuccess', { username: selectedUser.username }));
      closePassword();
    } catch (err) {
      toast.error(t('adminView.toast.passwordChangeError'));
      console.error('Failed to change password:', err);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      is_admin: user.is_admin
    });
    openEdit();
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    openPassword();
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    openDelete();
  };

  // Check if current user is admin
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      toast.warning(t('adminView.toast.cannotRevokeAdminSelf'));
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || !currentUser.is_admin) {
    return (
      <Box p="md">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title={t('adminView.accessDenied.title')} 
          color="red"
        >
          {t('adminView.accessDenied.message')}
        </Alert>
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart" align="center" mb="xs">
        <Text weight={500} size="lg">{title}</Text>
        <ActionIcon color={color} variant="light" radius="xl" size="lg">
          {icon}
        </ActionIcon>
      </Group>
      <Text size="xl" weight={700}>{value}</Text>
    </Card>
  );
  return (
    <Box p="md">
      <Box mb={30}>
        <Group position="apart" mb="xl">
          <Title order={2}>
            <Group spacing="xs">
              <IconShieldCheck size={28} style={{ color: theme.colors.violet[6] }} />
              <span>{t('adminView.title')}</span>
            </Group>
          </Title>
          <Text color="dimmed" size="sm">
            {t('adminView.subtitle')}
          </Text>
        </Group>
        
        {/* Stats Cards */}
        <Grid mb="lg">
          <Grid.Col span={3}>
            <StatCard 
              title={t('adminView.stats.totalUsers')} 
              value={userStats.total} 
              icon={<IconUser size={20} />}
              color="blue"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard 
              title={t('adminView.stats.activeUsers')} 
              value={userStats.active} 
              icon={<IconUserCheck size={20} />}
              color="green"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard 
              title={t('adminView.stats.inactiveUsers')} 
              value={userStats.inactive} 
              icon={<IconUserExclamation size={20} />}
              color="orange"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <StatCard 
              title={t('adminView.stats.administrators')} 
              value={userStats.admins} 
              icon={<IconChartPie size={20} />}
              color="violet"
            />
          </Grid.Col>
        </Grid>
      </Box>

      <Paper shadow="xs" p="md" mb="md">
        <Group position="apart" mb="md">
          <TextInput
            placeholder={t('adminView.searchPlaceholder')}
            icon={<IconSearch size="0.9rem" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
          <Group>
            <Button 
              leftIcon={<IconRefresh size="1rem" />}
              onClick={fetchUsers}
              variant="outline"
            >
              {t('adminView.buttons.refresh')}
            </Button>
          </Group>
        </Group>

        <Tabs value={activeTab} onTabChange={setActiveTab} mb="md">
          <Tabs.List>
            <Tabs.Tab value="all" icon={<IconUser size="0.8rem" />}>{t('adminView.tabs.allUsers')}</Tabs.Tab>
            <Tabs.Tab value="active" icon={<IconUserCheck size="0.8rem" />}>{t('adminView.tabs.activeUsers')}</Tabs.Tab>
            <Tabs.Tab value="inactive" icon={<IconUserExclamation size="0.8rem" />}>{t('adminView.tabs.inactiveUsers')}</Tabs.Tab>
            <Tabs.Tab value="admins" icon={<IconChartPie size="0.8rem" />}>{t('adminView.tabs.administrators')}</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title={t('adminView.errors.title')} color="red" mb="md">
            {error}
          </Alert>
        )}

        {loading ? (
          <>
            <Skeleton height={40} mb="sm" />
            <Skeleton height={40} mb="sm" />
            <Skeleton height={40} mb="sm" />
            <Skeleton height={40} mb="sm" />
          </>
        ) : (
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>{t('adminView.table.header.username')}</th>
                <th>{t('adminView.table.header.email')}</th>
                <th>{t('adminView.table.header.status')}</th>
                <th>{t('adminView.table.header.role')}</th>
                <th>{t('adminView.table.header.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge
                        color={user.is_active ? 'green' : 'red'}
                        variant="light"
                      >
                        {user.is_active ? t('adminView.table.status.active') : t('adminView.table.status.inactive')}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        color={user.is_admin ? 'violet' : 'blue'}
                        variant="light"
                      >
                        {user.is_admin ? t('adminView.table.role.admin') : t('adminView.table.role.user')}
                      </Badge>
                    </td>
                    <td>
                      <Group spacing="xs">
                        <Tooltip label={t('adminView.table.actions.editUser')}>
                          <ActionIcon 
                            color="blue" 
                            onClick={() => openEditModal(user)}
                            disabled={user.id === currentUser.id}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        
                        <Tooltip label={t('adminView.table.actions.changePassword')}>
                          <ActionIcon 
                            color="yellow" 
                            onClick={() => openPasswordModal(user)}
                            disabled={user.id === currentUser.id}
                          >
                            <IconLock size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        
                        <Tooltip label={t('adminView.table.actions.deleteUser')}>
                          <ActionIcon 
                            color="red" 
                            onClick={() => openDeleteModal(user)}
                            disabled={user.id === currentUser.id}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px 0' }}>
                    {t('adminView.table.noUsersFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Paper>

      {/* Edit User Modal */}
      <Modal
        opened={editModal}
        onClose={closeEdit}
        title={t('adminView.editModal.title', { username: selectedUser?.username })}
        size="md"
      >
        <TextInput
          label={t('adminView.editModal.usernameLabel')}
          placeholder={t('adminView.editModal.usernamePlaceholder')}
          value={editForm.username}
          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
          required
          mb="md"
        />
        
        <TextInput
          label={t('adminView.editModal.emailLabel')}
          placeholder={t('adminView.editModal.emailPlaceholder')}
          value={editForm.email}
          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          required
          mb="md"
        />
        
        <Group position="apart" mb="md">
          <Text>{t('adminView.editModal.activeStatusLabel')}</Text>
          <Switch
            checked={editForm.is_active}
            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            color="green"
            size="md"
            onLabel={<IconCheck size="1rem" />}
            offLabel={<IconX size="1rem" />}
          />
        </Group>
        
        <Group position="apart" mb="md">
          <Text>{t('adminView.editModal.adminPrivilegesLabel')}</Text>
          <Switch
            checked={editForm.is_admin}
            onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
            color="violet"
            size="md"
            onLabel={<IconCheck size="1rem" />}
            offLabel={<IconX size="1rem" />}
          />
        </Group>
        
        <Group position="right" mt="xl">
          <Button variant="outline" onClick={closeEdit}>{t('adminView.buttons.cancel')}</Button>
          <Button onClick={handleEditUser}>{t('adminView.editModal.saveChangesButton')}</Button>
        </Group>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        opened={passwordModal}
        onClose={closePassword}
        title={t('adminView.passwordModal.title', { username: selectedUser?.username })}
        size="md"
      >
        <Text color="dimmed" size="sm" mb="md">
          {t('adminView.passwordModal.description')}
        </Text>
        
        <PasswordInput
          label={t('adminView.passwordModal.newPasswordLabel')}
          placeholder={t('adminView.passwordModal.newPasswordPlaceholder')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        
        <Group position="right" mt="xl">
          <Button variant="outline" onClick={closePassword}>{t('adminView.buttons.cancel')}</Button>
          <Button onClick={handlePasswordChange} color="yellow">{t('adminView.passwordModal.changePasswordButton')}</Button>
        </Group>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={closeDelete}
        title={t('adminView.deleteModal.title')}
        size="md"
      >
        <Text mb="xl">
          {t('adminView.deleteModal.confirmation', { username: selectedUser?.username, BOLD: (chunks) => <b>{chunks}</b> })}
        </Text>
        
        <Group position="right">
          <Button variant="outline" onClick={closeDelete}>{t('adminView.buttons.cancel')}</Button>
          <Button color="red" onClick={handleDeleteUser}>{t('adminView.deleteModal.deleteButton')}</Button>        </Group>
      </Modal>
    </Box>
  );
}

export default AdminView;