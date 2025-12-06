import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { clienteService } from '../services/clienteService';
import { formatDate } from '../utils/dateUtils';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Pagination from '../components/Pagination';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    nombre_usuario: '',
    password_hash: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const clientes = await clienteService.getAll();
      setClientes(clientes);
    } catch (error) {
      toast.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
    }
    
    // Validar teléfono (opcional pero si se ingresa, debe ser válido)
    if (formData.telefono) {
      const telefonoRegex = /^[0-9]{10,15}$/;
      const telefonoLimpio = formData.telefono.replace(/[\s-()]/g, '');
      if (!telefonoRegex.test(telefonoLimpio)) {
        newErrors.telefono = 'Ingrese un teléfono válido (10-15 dígitos)';
      }
    }
    
    // Validaciones solo para crear nuevo cliente
    if (!editingCliente) {
      if (!formData.nombre_usuario || formData.nombre_usuario.trim().length < 4) {
        newErrors.nombre_usuario = 'El nombre de usuario debe tener al menos 4 caracteres';
      }
      
      if (!formData.password_hash || formData.password_hash.length < 6) {
        newErrors.password_hash = 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }
    
    setLoading(true);

    try {
      if (editingCliente) {
        // Al editar, solo enviamos datos de Persona
        const { nombre_usuario, password_hash, ...personaData } = formData;
        await clienteService.update(editingCliente.id_Persona, personaData);
        toast.success('Cliente actualizado correctamente');
      } else {
        // Al crear, enviamos datos completos incluyendo usuario
        const clienteData = {
          ...formData,
          rol: 'Cliente' // rol por defecto
        };
        await clienteService.create(clienteData);
        toast.success('Cliente creado correctamente');
      }
      setShowModal(false);
      resetForm();
      loadClientes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      nombre_usuario: cliente.usuario?.nombre_usuario || '',
      password_hash: '', // No mostramos password al editar
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      await clienteService.delete(id);
      toast.success('Cliente eliminado correctamente');
      loadClientes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  const resetForm = () => {
    setEditingCliente(null);
    setErrors({});
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      nombre_usuario: '',
      password_hash: '',
    });
  };

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const pagination = usePagination(filteredClientes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Clientes</h1>
          <p className="text-neutral-500 mt-1">Administra la base de datos de clientes</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowModal(true)}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <div className="text-sm text-neutral-500">
            {pagination.totalItems} cliente(s) encontrado(s)
          </div>
        </div>
      </Card>

      {/* Tabla de Clientes */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <FiUser className="mx-auto mb-4" size={48} />
            <p>No hay clientes registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Registro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagination.paginatedData.map((cliente) => (
                  <tr key={cliente.id_Persona} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <FiUser className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{cliente.nombre}</p>
                          {cliente.direccion && (
                            <p className="text-xs text-neutral-500 truncate max-w-[200px]">{cliente.direccion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <FiPhone size={14} />
                        {cliente.telefono || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <FiMail size={14} />
                        {cliente.email || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                        {cliente.usuario?.rol || 'Cliente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-sm">
                      {formatDate(cliente.fecha_registro)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id_Persona)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.changePageSize}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </div>
        )}
      </Card>

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Juan Pérez García"
            required
            minLength={3}
            icon={FiUser}
            error={errors.nombre}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="Ej: 5551234567"
              icon={FiPhone}
              error={errors.telefono}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: correo@ejemplo.com"
              icon={FiMail}
              required
              error={errors.email}
            />
          </div>

          {!editingCliente && (
            <>
              <Input
                label="Nombre de Usuario"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                placeholder="Ej: juan.perez"
                required
                minLength={4}
                error={errors.nombre_usuario}
              />
              <Input
                label="Contraseña"
                name="password_hash"
                type="password"
                value={formData.password_hash}
                onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                error={errors.password_hash}
              />
            </>
          )}

          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Ej: Calle Principal #123, Colonia Centro"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setShowModal(false); resetForm(); }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editingCliente ? 'Actualizar' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
