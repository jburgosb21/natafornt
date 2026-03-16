const { useState, useEffect } = React;

const API_URL = "http://localhost:4000"; // apunta al backend local

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

function PastelButton({ children, variant = "primary", ...props }) {
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
    <button className={base + " " + variants[variant]} {...props}>
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
  });
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
        setForm({ username: "", password: "", role: ROLES.MESERO });
        fetchUsers();
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = {
    [ROLES.ADMIN]: "Administrador",
    [ROLES.MESERO]: "Mesero",
    [ROLES.BODEGA]: "Bodega",
    [ROLES.CAJA]: "Caja",
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card title="Crear usuarios del equipo">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Usuario</label>
            <input
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Contraseña</label>
            <input
              type="password"
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rose-500">Rol</label>
            <select
              className="rounded-full border border-rose-200 px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value={ROLES.MESERO}>Mesero</option>
              <option value={ROLES.BODEGA}>Bodega</option>
              <option value={ROLES.CAJA}>Caja</option>
            </select>
          </div>
          <PastelButton type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear usuario"}
          </PastelButton>
        </form>
      </Card>
      <Card title="Equipo Crema de Nata">
        <div className="space-y-2 max-h-72 overflow-auto pr-1">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between bg-crema-rosa/60 rounded-2xl px-3 py-2 text-sm"
            >
              <div>
                <p className="font-semibold text-rose-700">
                  {u.username}
                </p>
                <p className="text-[11px] text-rose-500">
                  {roleLabel[u.role] || u.role}
                </p>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-xs text-rose-400">
              Aún no hay usuarios creados.
            </p>
          )}
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
  const [size, setSize] = useState("pequeno");
  const [extras, setExtras] = useState({
    salsa: false,
    chispa: false,
    galleta: false,
  });
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [cart, setCart] = useState([]);

  const fetchFlavors = async () => {
    const res = await fetch(API_URL + "/menu", {
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
    const sabores = selectedFlavors.length === 0 ? [] : [...selectedFlavors];
    const priceSize =
      size === "pequeno" ? 2000 : size === "mediano" ? 3000 : 4000;
    const extrasPrice = extras.galleta ? 500 : 0;
    const total = priceSize + extrasPrice;
    const item = {
      id: Date.now(),
      plate,
      location,
      size,
      sabores,
      extras: { ...extras },
      total,
    };
    setCart((c) => [...c, item]);
    setSelectedFlavors([]);
    setExtras({ salsa: false, chispa: false, galleta: false });
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
      onSendOrder && onSendOrder();
    }
  };

  const sizeLabel = {
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
                ["parqueadero", "Parqueadero"],
                ["calle", "Calle"],
                ["mesas", "Mesas"],
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
            <label className="text-xs text-rose-500">
              Tamaño del vaso
            </label>
            <div className="flex flex-wrap gap-2">
              {["pequeno", "mediano", "grande"].map((s) => (
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
                variant={extras.chispa ? "primary" : "soft"}
                onClick={() => toggleExtra("chispa")}
              >
                Chispas
              </PastelButton>
              <PastelButton
                type="button"
                variant={extras.galleta ? "primary" : "soft"}
                onClick={() => toggleExtra("galleta")}
              >
                Porción de galleta (+$500)
              </PastelButton>
            </div>
          </div>
          <PastelButton type="button" onClick={addToCart}>
            Añadir helado al carrito
          </PastelButton>
        </div>
      </Card>
      <Card title="Sabores disponibles">
        <p className="text-xs text-rose-500 mb-2">
          Puedes combinar todos los sabores que quieras. Tropical
          siempre está disponible por defecto.
        </p>
        <div className="flex flex-wrap gap-2">
          {flavors.map((f) => {
            const disabled = f.estado === "nada";
            const selected = selectedFlavors.includes(f.nombre);
            return (
              <button
                key={f.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleFlavor(f.nombre, disabled)}
                className={
                  "px-3 py-1 rounded-full text-xs font-semibold border " +
                  (disabled
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : selected
                    ? "bg-rose-400 border-rose-500 text-white"
                    : "bg-crema-rosa border-rose-200 text-rose-700 hover:bg-rose-200")
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
              <div className="flex justify-between">
                <span className="font-semibold text-rose-700">
                  {sizeLabel[item.size]} - ${item.total}
                </span>
                <span className="text-[11px] text-rose-500">
                  {item.location} {item.plate && `• ${item.plate}`}
                </span>
              </div>
              <p className="text-[11px] text-rose-600">
                Sabores: {item.sabores.join(", ")}
              </p>
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
    </div>
  );
}

function CajaView({ token }) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch(API_URL + "/orders", {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 5000);
    return () => clearInterval(id);
  }, []);

  const sizeLabel = {
    pequeno: "Pequeño",
    mediano: "Mediano",
    grande: "Grande",
  };

  return (
    <Card title="Pedidos para cocina y caja">
      <div className="space-y-4 max-h-[28rem] overflow-auto pr-1">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-crema-vainilla rounded-3xl border border-crema-rosa/60 p-3"
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs font-semibold text-rose-500">
                Pedido #{order.id}
              </span>
              <span className="text-xs text-rose-400">
                {order.created_at_readable}
              </span>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 rounded-2xl px-3 py-2 text-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-rose-700">
                      {sizeLabel[item.size]} - ${item.total}
                    </span>
                    <span className="text-[11px] text-rose-500">
                      {item.location}{" "}
                      {item.plate && `• ${item.plate}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-600">
                    Sabores: {item.sabores.join(", ")}
                  </p>
                  <p className="text-[11px] text-rose-500">
                    Extras:
                    {item.extras.salsa ? " salsa" : ""}
                    {item.extras.chispa ? " chispas" : ""}
                    {item.extras.galleta ? " galleta" : ""}
                    {!item.extras.salsa &&
                      !item.extras.chispa &&
                      !item.extras.galleta &&
                      " ninguno"}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold text-rose-600">
              Total pedido: ${order.total}
            </p>
          </div>
        ))}
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
  const [session, setSession] = useState(null);

  const logout = () => setSession(null);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crema-rosa via-crema-vainilla to-crema-caramelo flex items-center justify-center">
        <div className="w-full max-w-5xl p-4">
          <LoginView onLogin={setSession} />
        </div>
      </div>
    );
  }

  const { token, user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-crema-rosa via-crema-vainilla to-crema-caramelo">
      <header className="w-full border-b border-white/70 bg-white/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-rose-500">
              Crema de Nata
            </h1>
            <p className="text-[11px] text-rose-400">
              Panel interno • {user.role.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-rose-500 bg-crema-rosa/80 px-3 py-1 rounded-full">
              {user.username}
            </span>
            <PastelButton variant="outline" onClick={logout}>
              Cerrar sesión
            </PastelButton>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {user.role === ROLES.ADMIN && <AdminView token={token} />}
        {user.role === ROLES.BODEGA && <BodegaView token={token} />}
        {user.role === ROLES.MESERO && (
          <MeseroView token={token} onSendOrder={() => {}} />
        )}
        {user.role === ROLES.CAJA && <CajaView token={token} />}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

