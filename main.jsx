const { useState, useEffect } = React;

function getApiUrl() {
  // Permite override para pruebas: ?api=https://tu-backend...
  try {
    const url = new URL(window.location.href);
    const api = url.searchParams.get("api");
    if (api) return api.replace(/\/+$/, "");
  } catch (_) {}

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocal) return "http://localhost:4000";

  // Producción (Netlify) -> Render
  return "https://nataback.onrender.com";
}

const API_URL = getApiUrl();

const ROLES = {
  ADMIN: "admin",
  BODEGA: "bodega",
  MESERO: "mesero",
  CAJA: "caja",
};

function Card({ title, children, className = "" }) {
  return (
    <div
      className={
        "rounded-3xl shadow-lg bg-white/80 border border-crema-rosa/40 p-6 flex flex-col gap-4 " +
        className
      }
    >
      <h2 className="text-2xl font-semibold text-rose-500">{title}</h2>
      {children}
    </div>
  );
}

function PastelButton({ children, variant = "primary", className = "", ...props }) {
  const base =
    "px-4 py-2 rounded-full text-sm font-semibold transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-rose-400 text-white hover:bg-rose-500",
    outline:
      "bg-white text-rose-500 border border-rose-300 hover:bg-rose-50",
    soft: "bg-crema-rosa text-rose-700 hover:bg-rose-200",
    pill: "bg-crema-caramelo text-amber-900 hover:bg-amber-200",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function LoginView({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }
      const data = await res.json();
      onLogin(data);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-rose-500">
          Crema de Nata
        </h1>
        <p className="text-rose-700 text-lg">
          Panel interno para coordinar inventario, pedidos y caja
          de la heladería más dulce de la ciudad.
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-crema-rosa text-rose-700 text-xs font-semibold">
            Pasteles
          </span>
          <span className="px-3 py-1 rounded-full bg-crema-caramelo text-amber-900 text-xs font-semibold">
            Helados artesanales
          </span>
          <span className="px-3 py-1 rounded-full bg-crema-menta text-emerald-900 text-xs font-semibold">
            Sonrisas
          </span>
        </div>
      </div>
      <Card title="Ingreso solo personal">
        <form onSubmit={handleSubmit} className="space-y-4 w-72">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-rose-600">Usuario</label>
            <input
              className="rounded-full border border-rose-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-rose-600">Contraseña</label>
            <input
              type="password"
              className="rounded-full border border-rose-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <PastelButton type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar a Crema de Nata"}
          </PastelButton>
          <p className="text-[11px] text-rose-400">
            El registro está deshabilitado. Solo el usuario administrador
            puede crear cuentas para mesero, bodega y caja.
          </p>
        </form>
      </Card>
    </div>
  );
}

function AdminView({ token }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: ROLES.MESERO,
    active: true,
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", password: "", role: ROLES.MESERO, active: true });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch(API_URL + "/users", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ username: "", password: "", role: ROLES.MESERO, active: true });
        fetchUsers();
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditForm({ username: user.username, password: "", role: user.role, active: user.active });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ username: "", password: "", role: ROLES.MESERO, active: true });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const payload = { username: editForm.username, role: editForm.role, active: editForm.active };
    if (editForm.password) payload.password = editForm.password;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        cancelEdit();
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al actualizar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  const [userTab, setUserTab] = useState("active");

  const roleLabel = {
    [ROLES.ADMIN]: "Administrador",
    [ROLES.MESERO]: "Mesero",
    [ROLES.BODEGA]: "Bodega",
    [ROLES.CAJA]: "Caja",
  };

  const visibleUsers = users.filter((u) =>
    userTab === "active" ? u.active : !u.active
  );

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Crear usuarios del equipo">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rose-500">Usuario</label>
              <input
                className="rounded-full border border-rose-200 px-3 py-2 text-sm"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rose-500">Contraseña</label>
              <input
                type="password"
                className="rounded-full border border-rose-200 px-3 py-2 text-sm"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rose-500">Rol</label>
              <select
                className="rounded-full border border-rose-200 px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value={ROLES.MESERO}>Mesero</option>
                <option value={ROLES.BODEGA}>Bodega</option>
                <option value={ROLES.CAJA}>Caja</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-rose-500">Activo</label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
            </div>
            <PastelButton type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear usuario"}
            </PastelButton>
          </form>
        </Card>

        <Card title="Equipo Crema de Nata">
          <div className="flex gap-2 items-center mb-3">
            <button
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                userTab === "active"
                  ? "bg-rose-500 text-white"
                  : "bg-white text-rose-600 border border-rose-200"
              }`}
              onClick={() => setUserTab("active")}
            >
              Activos
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                userTab === "archived"
                  ? "bg-rose-500 text-white"
                  : "bg-white text-rose-600 border border-rose-200"
              }`}
              onClick={() => setUserTab("archived")}
            >
              Archivados
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {visibleUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-white/85 rounded-xl px-3 py-2 text-sm border border-rose-100 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-rose-700">{u.username}</p>
                  <p className="text-[11px] text-rose-500">
                    {roleLabel[u.role] || u.role} • {u.active ? "Activo" : "Archivado"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {u.role !== ROLES.ADMIN && userTab === "active" && (
                    <button
                      className="text-[11px] bg-rose-100 text-rose-700 px-2 py-1 rounded-full hover:bg-rose-200 transition"
                      onClick={() => startEdit(u)}
                    >
                      Editar
                    </button>
                  )}
                  {u.role !== ROLES.ADMIN && (
                    <button
                      className={`text-[11px] px-2 py-1 rounded-full transition ${
                        u.active
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      onClick={async () => {
                        const res = await fetch(`${API_URL}/users/${u.id}`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                          },
                          body: JSON.stringify({ active: !u.active }),
                        });
                        if (res.ok) fetchUsers();
                      }}
                    >
                      {u.active ? "Archivar" : "Desarchivar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {visibleUsers.length === 0 && (
              <p className="text-xs text-rose-400">No hay usuarios en esta vista.</p>
            )}
          </div>
        </Card>
      </div>

      {editingUser && (
        <Card title={`Editar usuario ${editingUser.username}`}>
          <form onSubmit={submitEdit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rose-500">Usuario</label>
              <input
                className="rounded-full border border-rose-200 px-3 py-2 text-sm"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rose-500">Nueva contraseña</label>
              <input
                type="password"
                className="rounded-full border border-rose-200 px-3 py-2 text-sm"
                value={editForm.password}
                placeholder="Dejar en blanco sin cambiar"
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rose-500">Rol</label>
              <select
                className="rounded-full border border-rose-200 px-3 py-2 text-sm"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value={ROLES.MESERO}>Mesero</option>
                <option value={ROLES.BODEGA}>Bodega</option>
                <option value={ROLES.CAJA}>Caja</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-rose-500">Activo</label>
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <PastelButton type="submit" disabled={loading}>
                Guardar cambios
              </PastelButton>
              <PastelButton variant="outline" type="button" onClick={cancelEdit}>
                Cancelar
              </PastelButton>
              <PastelButton
                variant="soft"
                type="button"
                onClick={async () => {
                  const newActive = !editForm.active;
                  setLoading(true);
                  try {
                    const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                      },
                      body: JSON.stringify({ active: newActive }),
                    });
                    if (res.ok) {
                      setEditForm({ ...editForm, active: newActive });
                      fetchUsers();
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {editForm.active ? "Archivar" : "Desarchivar"}
              </PastelButton>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function StatsView({ token }) {
  const [stats, setStats] = useState({ daily: [], weekly: [], yearly: [] });

  useEffect(() => {
    const loadStats = async () => {
      const res = await fetch(API_URL + "/stats", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    };

    loadStats();
  }, [token]);

  return (
    <div className="space-y-6">
      <Card title="Estadísticas de pedidos">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-rose-700 mb-2">Últimos 30 días</h3>
            {stats.daily.length === 0 ? (
              <p className="text-xs text-rose-400">No hay datos</p>
            ) : (
              stats.daily.map((s) => (
                <p key={s.period} className="text-xs text-gray-600">
                  {s.period}: {s.count} pedidos | ${s.total}
                </p>
              ))
            )}
          </div>
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-rose-700 mb-2">Últimas 12 semanas</h3>
            {stats.weekly.length === 0 ? (
              <p className="text-xs text-rose-400">No hay datos</p>
            ) : (
              stats.weekly.map((s) => (
                <p key={s.period} className="text-xs text-gray-600">
                  {s.period}: {s.count} pedidos | ${s.total}
                </p>
              ))
            )}
          </div>
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-rose-700 mb-2">Por año</h3>
            {stats.yearly.length === 0 ? (
              <p className="text-xs text-rose-400">No hay datos</p>
            ) : (
              stats.yearly.map((s) => (
                <p key={s.period} className="text-xs text-gray-600">
                  {s.period}: {s.count} pedidos | ${s.total}
                </p>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function BodegaView({ token }) {
  const [flavors, setFlavors] = useState([]);
  const [newFlavor, setNewFlavor] = useState({
    nombre: "",
    estado: "bien",
  });

  const fetchFlavors = async () => {
    const res = await fetch(API_URL + "/inventory", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setFlavors(data);
    }
  };

  useEffect(() => {
    fetchFlavors();
  }, []);

  const createFlavor = async (e) => {
    e.preventDefault();
    const res = await fetch(API_URL + "/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(newFlavor),
    });
    if (res.ok) {
      setNewFlavor({ nombre: "", estado: "bien" });
      fetchFlavors();
    }
  };

  const updateEstado = async (id, estado) => {
    const res = await fetch(API_URL + "/inventory/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) {
      fetchFlavors();
    }
  };

  const badgeColor = (estado) => {
    if (estado === "bien") return "bg-emerald-100 text-emerald-800";
    if (estado === "poco") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card title="Helados en bodega">
        <div className="space-y-3 max-h-80 overflow-auto pr-1">
          {flavors.map((f) => (
            <div
              key={f.id}
              className="bg-crema-rosa/60 rounded-2xl px-3 py-3 flex justify-between items-center text-sm"
            >
              <div>
                <p className="font-semibold text-rose-700">
                  {f.nombre}
                </p>
                <span
                  className={
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold " +
                    badgeColor(f.estado)
                  }
                >
                  {f.estado === "bien"
                    ? "Cantidad bien"
                    : f.estado === "poco"
                    ? "Queda poco"
                    : "Sin existencias"}
                </span>
              </div>
              <div className="flex gap-1">
                <PastelButton
                  variant="soft"
                  onClick={() => updateEstado(f.id, "bien")}
                >
                  Bien
                </PastelButton>
                <PastelButton
                  variant="soft"
                  onClick={() => updateEstado(f.id, "poco")}
                >
                  Poco
                </PastelButton>
                <PastelButton
                  variant="outline"
                  onClick={() => updateEstado(f.id, "nada")}
                >
                  Nada
                </PastelButton>
              </div>
            </div>
          ))}
          {flavors.length === 0 && (
            <p className="text-xs text-rose-400">
              Aún no hay sabores cargados.
            </p>
          )}
        </div>
      </Card>
      <Card title="Agregar nuevo sabor">
        <form onSubmit={createFlavor} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Nombre</label>
            <input
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              value={newFlavor.nombre}
              onChange={(e) =>
                setNewFlavor({ ...newFlavor, nombre: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Estado</label>
            <select
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              value={newFlavor.estado}
              onChange={(e) =>
                setNewFlavor({ ...newFlavor, estado: e.target.value })
              }
            >
              <option value="bien">Cantidad bien</option>
              <option value="poco">Poco</option>
              <option value="nada">Nada</option>
            </select>
          </div>
          <PastelButton type="submit">Guardar sabor</PastelButton>
        </form>
      </Card>
    </div>
  );
}

function MeseroView({ token, onSendOrder }) {
  const [flavors, setFlavors] = useState([]);
  const [location, setLocation] = useState("parqueadero");
  const [plate, setPlate] = useState("");
  const [size, setSize] = useState("mini");
  const [quantity, setQuantity] = useState(1);
  const [itemObservation, setItemObservation] = useState("");
  const [extras, setExtras] = useState({
    salsa: false,
    chispa: false,
    tajin: false,
    galleta: false,
  });
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [cart, setCart] = useState([]);
  const [mySales, setMySales] = useState([]);
  const [itemError, setItemError] = useState("");

  const fetchFlavors = async () => {
    const res = await fetch(API_URL + "/menu", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setFlavors(data);
    }
  };

  const fetchMySales = async () => {
    const res = await fetch(API_URL + "/orders/mine", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setMySales(data);
    }
  };

  useEffect(() => {
    fetchFlavors();
    fetchMySales();
  }, []);

  const toggleFlavor = (nombre, disabled) => {
    if (disabled) return;
    setSelectedFlavors((prev) =>
      prev.includes(nombre)
        ? prev.filter((n) => n !== nombre)
        : [...prev, nombre]
    );
  };

  const toggleExtra = (key) => {
    setExtras((e) => ({ ...e, [key]: !e[key] }));
  };

  const addToCart = () => {
    if (selectedFlavors.length === 0) {
      setItemError("Elige al menos 1 sabor para añadir el helado.");
      return;
    }
    setItemError("");
    const qty = Math.max(1, Number(quantity) || 1);
    const sabores = [...selectedFlavors];
    const priceSize =
      size === "mini" ? 2000 :
      size === "pequeno" ? 2500 :
      size === "mediano" ? 3000 :
      size === "grande" ? 4000 : 2000;
    const extrasPrice = (extras.galleta ? 500 : 0);
    const unitTotal = priceSize + extrasPrice;
    const total = unitTotal * qty;

    const key = JSON.stringify({ location, plate, size, sabores: sabores.sort(), extras, unitTotal });

    setCart((c) => {
      const existing = c.find((item) => item.key === key);
      if (existing) {
        return c.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: item.quantity + qty,
                total: item.total + total,
              }
            : item
        );
      }
      return [
        ...c,
        {
          id: Date.now() + Math.random(),
          key,
          plate,
          location,
          size,
          sabores,
          extras: { ...extras },
          observation: itemObservation,
          quantity: qty,
          unitTotal,
          total,
        },
      ];
    });

    setSelectedFlavors([]);
    setExtras({ salsa: false, chispa: false, tajin: false, galleta: false });
    setQuantity(1);
    setItemObservation("");
  };

  const sendOrder = async () => {
    if (cart.length === 0) return;
    const res = await fetch(API_URL + "/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ items: cart }),
    });
    if (res.ok) {
      setCart([]);
      await fetchMySales();
      onSendOrder && onSendOrder();
    }
  };

  const cancelSale = async (orderId) => {
    const confirmed = window.confirm("¿Confirmas cancelar este pedido? Esto avisará a caja.");
    if (!confirmed) return;
    const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (res.ok) {
      await fetchMySales();
      onSendOrder && onSendOrder();
      alert("Pedido cancelado y enviado a caja.");
    } else {
      const err = await res.json();
      alert(err.error || "No se pudo cancelar el pedido");
    }
  };

  const sizeLabel = {
    mini: "Mini",
    pequeno: "Pequeño",
    mediano: "Mediano",
    grande: "Grande",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Datos del pedido">
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">
              Placa del vehículo
            </label>
            <input
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC123"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">
              Ubicación del cliente
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ["zona-a", "Zona A"],
                ["zona-b", "Zona B"],
                ["parqueadero", "Parqueadero"],
                ["patio", "Patio"],
              ].map(([value, label]) => (
                <PastelButton
                  key={value}
                  variant={location === value ? "primary" : "soft"}
                  type="button"
                  onClick={() => setLocation(value)}
                >
                  {label}
                </PastelButton>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-full border border-rose-200 px-3 py-2 text-sm w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Observación</label>
            <input
              value={itemObservation}
              onChange={(e) => setItemObservation(e.target.value)}
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              placeholder="Ej: sin azúcar, extra cremoso"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">
              Tamaño del vaso
            </label>
            <div className="flex flex-wrap gap-2">
              {["mini", "pequeno", "mediano", "grande"].map((s) => (
                <PastelButton
                  key={s}
                  variant={size === s ? "primary" : "soft"}
                  type="button"
                  onClick={() => setSize(s)}
                >
                  {sizeLabel[s]}
                </PastelButton>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">
              Extras deliciosos
            </label>
            <div className="flex flex-wrap gap-2">
              <PastelButton
                type="button"
                variant={extras.salsa ? "primary" : "soft"}
                onClick={() => toggleExtra("salsa")}
              >
                Salsa
              </PastelButton>
              <PastelButton
                type="button"
                variant={extras.tajin ? "primary" : "soft"}
                onClick={() => toggleExtra("tajin")}
              >
                Tajín
              </PastelButton>
              <PastelButton
                type="button"
                variant={extras.chispa ? "primary" : "soft"}
                onClick={() => toggleExtra("chispa")}
              >
                Chispas
              </PastelButton>
              <div className="flex items-center gap-2">
                <PastelButton
                  type="button"
                  variant={extras.galleta ? "primary" : "soft"}
                  onClick={() => setExtras((e) => ({ ...e, galleta: !e.galleta }))}
                >
                  Porción de galleta (+$500)
                </PastelButton>
              </div>
            </div>
          </div>
          {itemError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
              {itemError}
            </p>
          )}
        </div>
      </Card>
      <Card title="Acciones del pedido">
        <div className="flex justify-center">
          <PastelButton type="button" onClick={addToCart} variant="primary" className="w-full max-w-xs">
            Añadir helado al carrito
          </PastelButton>
        </div>
      </Card>
      <Card title="Sabores disponibles">
        <p className="text-xs text-rose-500 mb-2">
          Puedes combinar todos los sabores que quieras. Todos los sabores
          dependen del inventario que marque bodega.
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] mb-3">
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            Bien (disponible)
          </span>
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Poco (escaso)
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            Nada (sin stock)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {flavors.map((f) => {
            const disabled = f.estado === "nada";
            const selected = selectedFlavors.includes(f.nombre);
            const scarcityClass =
              f.estado === "poco"
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : f.estado === "bien"
                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";

            return (
              <button
                key={f.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleFlavor(f.nombre, disabled)}
                className={
                  "px-3 py-1 rounded-full text-xs font-semibold border " +
                  (selected
                    ? "bg-rose-400 border-rose-500 text-white"
                    : scarcityClass)
                }
              >
                {f.nombre}
                {disabled && " (sin stock)"}
              </button>
            );
          })}
          {flavors.length === 0 && (
            <p className="text-xs text-rose-400">
              No hay sabores cargados desde bodega.
            </p>
          )}
        </div>
      </Card>
      <Card title="Carrito listo para caja">
        <div className="space-y-3 max-h-80 overflow-auto pr-1 text-sm">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-crema-rosa/60 rounded-2xl px-3 py-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-rose-700">
                    {sizeLabel[item.size]} x{item.quantity} • ${item.total}
                  </span>
                  <p className="text-[11px] text-rose-500">
                    unidad: ${item.unitTotal}
                  </p>
                </div>
                <span className="text-[11px] text-rose-500">
                  {item.location} {item.plate && `• ${item.plate}`}
                </span>
              </div>
              <p className="text-[11px] text-rose-600">
                Sabores: {item.sabores.join(", ")}
              </p>
              <p className="text-[11px] text-slate-600">
                Extras: {item.extras.salsa ? "salsa" : ""}
                {item.extras.chispa ? (item.extras.salsa ? ", chispas" : "chispas") : ""}
                {item.extras.galleta ? (item.extras.salsa || item.extras.chispa ? ", galleta" : "galleta") : ""}
                {(!item.extras.salsa && !item.extras.chispa && !item.extras.galleta) ? "ninguno" : ""}
              </p>
              {item.observation && (
                <p className="text-[11px] text-amber-700">Observación: {item.observation}</p>
              )}
            </div>
          ))}
          {cart.length === 0 && (
            <p className="text-xs text-rose-400">
              Añade helados al carrito para enviar el pedido a caja.
            </p>
          )}
        </div>
        <PastelButton
          type="button"
          onClick={sendOrder}
          disabled={cart.length === 0}
        >
          Enviar pedido a caja
        </PastelButton>
      </Card>
      <Card title="Mis ventas (este mes)">
        <div className="space-y-2 max-h-80 overflow-auto pr-1 text-sm">
          {mySales.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl px-3 py-2 border ${order.status === "cancelled" ? "border-red-300 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-rose-700">Pedido #{order.id}</p>
                  <p className="text-[11px] text-rose-500">{order.created_at_readable}</p>
                </div>
                <div className="flex gap-1">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${order.status === "cancelled" ? "bg-rose-100 text-rose-700" : order.status === "entregado" ? "bg-blue-100 text-blue-700" : order.status === "apunto_salida" ? "bg-violet-100 text-violet-700" : order.status === "cocinando" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-800"}`}>
                    {order.status === "pending" ? "Pendiente" : order.status === "cocinando" ? "Cocinando" : order.status === "apunto_salida" ? "Listo para salida" : order.status === "entregado" ? "Entregado" : order.status === "cancelled" ? "Cancelado" : order.status}
                  </span>
                  {order.status !== "cancelled" && order.status !== "entregado" && (
                    <button
                      className="text-[11px] text-red-600 font-semibold hover:text-red-800"
                      onClick={() => cancelSale(order.id)}
                    >
                      Anular
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-rose-600">Total: ${order.total}</p>
              {order.items.map((item) => (
                <p key={item.id} className="text-[11px] text-slate-600">
                  x{item.quantity || 1} {item.sabores.join(", ")} ({item.size})
                </p>
              ))}
            </div>
          ))}
          {mySales.length === 0 && (
            <p className="text-xs text-rose-400">Aún no hay ventas registradas.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function CajaView({ token }) {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState("undelivered");
  const [orderUpdates, setOrderUpdates] = useState({});

  const fetchOrders = async () => {
    const dateParam = selectedDate ? `?date=${selectedDate}` : "";
    const res = await fetch(API_URL + "/orders" + dateParam, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
      const updates = {};
      data.forEach((o) => {
        updates[o.id] = { status: o.status, observation: o.observation || "" };
      });
      setOrderUpdates(updates);
    }
  };

  const updateOrderComing = async (orderId) => {
    const update = orderUpdates[orderId];
    if (!update) return;

    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status: update.status, observation: update.observation }),
    });
    if (res.ok) {
      await fetchOrders();
    } else {
      const err = await res.json();
      alert(err.error || "No se pudo actualizar el pedido");
    }
  };

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 5000);
    return () => clearInterval(id);
  }, [selectedDate]);

  const sizeLabel = {
    pequeno: "Pequeño",
    mediano: "Mediano",
    grande: "Grande",
  };

  return (
    <Card title="Pedidos para cocina y caja">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-rose-500">Filtrar por fecha:</span>
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-full border border-rose-200 px-3 py-2 text-xs"
          />
          <PastelButton type="button" onClick={fetchOrders} className="text-xs px-3 py-1">
            Cargar
          </PastelButton>
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-rose-500">Ver:</span>
          {[
            { key: "undelivered", label: "Sin entregar" },
            { key: "entregado", label: "Entregados" },
            { key: "cancelled", label: "Cancelados" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setStatusFilter(option.key)}
              className={`text-[11px] px-2 py-1 rounded-full border ${
                statusFilter === option.key
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 max-h-[28rem] overflow-auto pr-1">
        {orders
          .filter((order) => {
            if (statusFilter === "undelivered") return ["pending", "cocinando", "apunto_salida"].includes(order.status);
            return order.status === statusFilter;
          })
          .map((order) => {
          const update = orderUpdates[order.id] || { status: order.status, observation: order.observation || "" };
          const isFrozen = order.status === "entregado" || order.status === "cancelled";
          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-2 ${order.status === "cancelled" ? "bg-red-50 border-red-200" : "bg-crema-vainilla border-crema-rosa/60"}`}
            >
              <div className="flex justify-between mb-1 items-center">
                <span className="text-xs font-semibold text-rose-500">Pedido #{order.id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400">{order.created_at_readable}</span>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${order.status === "cancelled" ? "bg-rose-100 text-rose-700" : order.status === "entregado" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {order.status === "cancelled" ? "Cancelado" : order.status === "entregado" ? "Entregado" : "En proceso"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 rounded-xl px-2 py-1 text-[11px]"
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className="font-semibold text-rose-700">
                        {sizeLabel[item.size]} x{item.quantity || 1} - ${item.total}
                      </span>
                      <span className="text-[11px] text-rose-500">
                        {item.location}{item.plate ? ` • ${item.plate}` : ""}
                      </span>
                    </div>
                    {item.observation && (
                      <p className="text-[11px] text-amber-700">Observación: {item.observation}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-slate-600">
                      <span>Sabores: {item.sabores.join(", ")}</span>
                      <span>
                        Extras:{" "}
                        {item.extras.salsa ? "salsa" : ""}
                        {item.extras.chispa ? (item.extras.salsa ? ", chispas" : "chispas") : ""}
                        {item.extras.galleta ? (item.extras.salsa || item.extras.chispa ? ", galleta" : "galleta") : ""}
                        {(!item.extras.salsa && !item.extras.chispa && !item.extras.galleta) ? " ninguno" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-rose-600">Total pedido: ${order.total}</p>
              <div className="mt-2 bg-white rounded-lg p-2 border border-rose-100">
                <div className="flex flex-wrap gap-1 mb-1">
                  {[
                    { value: "pending", label: "Pendiente", style: "bg-amber-200 text-amber-800 border-amber-300" },
                    { value: "cocinando", label: "Cocina", style: "bg-blue-200 text-blue-800 border-blue-300" },
                    { value: "apunto_salida", label: "Salida", style: "bg-violet-200 text-violet-800 border-violet-300" },
                    { value: "entregado", label: "Entregado", style: "bg-emerald-200 text-emerald-800 border-emerald-300" },
                    { value: "cancelled", label: "Cancelado", style: "bg-slate-200 text-slate-700 border-slate-300" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      disabled={isFrozen}
                      onClick={() => setOrderUpdates((prev) => ({ ...prev, [order.id]: { ...update, status: s.value } }))}
                      className={`text-[11px] px-2 py-1 rounded-full border ${
                        update.status === s.value
                          ? `${s.style} font-bold shadow-inner`
                          : `bg-white text-rose-600 border-rose-200 hover:bg-rose-50`
                      } ${isFrozen ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="mt-1">
                  <label className="text-[11px] text-rose-500">Obs:</label>
                  <textarea
                    disabled={isFrozen}
                    value={update.observation}
                    onChange={(e) => setOrderUpdates((prev) => ({ ...prev, [order.id]: { ...update, observation: e.target.value } }))}
                    className="w-full rounded-lg border border-rose-200 px-2 py-1 text-xs mt-1"
                    rows={1}
                    placeholder="sin observacion"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isFrozen || (update.status === order.status && update.observation === (order.observation || ""))}
                    onClick={() => updateOrderComing(order.id)}
                    className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="text-xs text-rose-400">
            Aún no hay pedidos en cola. Esperando dulces órdenes...
          </p>
        )}
      </div>
    </Card>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem("crema_nata_session");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn("Sesion local corrupta, limpiando", err);
      localStorage.removeItem("crema_nata_session");
      return null;
    }
  });
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const stored = localStorage.getItem("crema_nata_section");
      return stored ? stored : "admin";
    } catch (err) {
      console.warn("Section local corrupta, limpiando", err);
      localStorage.removeItem("crema_nata_section");
      return "admin";
    }
  });

  const logout = () => {
    localStorage.removeItem("crema_nata_session");
    localStorage.removeItem("crema_nata_section");
    setSession(null);
    setActiveSection("admin");
  };

  const handleLogin = (sessionData) => {
    localStorage.setItem("crema_nata_session", JSON.stringify(sessionData));
    const initialSection = sessionData.user.role;
    localStorage.setItem("crema_nata_section", initialSection);
    setSession(sessionData);
    setActiveSection(initialSection);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crema-rosa via-crema-vainilla to-crema-caramelo flex items-center justify-center">
        <div className="w-full max-w-5xl p-4">
          <LoginView onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const { token, user } = session;

  const adminNavItems = [
    { key: ROLES.ADMIN, label: "Admin" },
    { key: ROLES.BODEGA, label: "Bodega" },
    { key: ROLES.MESERO, label: "Mesero" },
    { key: ROLES.CAJA, label: "Caja" },
    { key: "stats", label: "Estadísticas" },
  ];

  const handleSectionClick = (section) => {
    if (user.role === ROLES.ADMIN) {
      localStorage.setItem("crema_nata_section", section);
      setActiveSection(section);
    }
  };

  const renderSection = () => {
    if (user.role !== ROLES.ADMIN) {
      const section = user.role;
      if (section === ROLES.BODEGA) return <BodegaView token={token} />;
      if (section === ROLES.MESERO) return <MeseroView token={token} onSendOrder={() => {}} />;
      if (section === ROLES.CAJA) return <CajaView token={token} />;
      return <AdminView token={token} />;
    }

    if (activeSection === ROLES.ADMIN) return <AdminView token={token} />;
    if (activeSection === ROLES.BODEGA) return <BodegaView token={token} />;
    if (activeSection === ROLES.MESERO) return <MeseroView token={token} onSendOrder={() => {}} />;
    if (activeSection === ROLES.CAJA) return <CajaView token={token} />;
    if (activeSection === "stats") return <StatsView token={token} />;
    return <AdminView token={token} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crema-rosa via-crema-vainilla to-crema-caramelo">
      <header className="w-full border-b border-white/70 bg-white/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-rose-500">Crema de Nata</h1>
            <p className="text-[11px] text-rose-400">
              Panel interno • {user.role.toUpperCase()}
              {user.role === ROLES.ADMIN && ` (ver como ${activeSection})`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-rose-500 bg-crema-rosa/80 px-3 py-1 rounded-full">{user.username}</span>
            <PastelButton variant="outline" onClick={logout}>Cerrar sesión</PastelButton>
          </div>
        </div>
        {user.role === ROLES.ADMIN && (
          <nav className="max-w-6xl mx-auto px-4 py-2 flex gap-2">
            {adminNavItems.map((item) => (
              <PastelButton
                key={item.key}
                variant={activeSection === item.key ? "primary" : "soft"}
                onClick={() => handleSectionClick(item.key)}
              >
                {item.label}
              </PastelButton>
            ))}
          </nav>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {renderSection()}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

