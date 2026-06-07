"use client"

const DB_KEY = 'estetica_mock_db';

let globalListeners = [];

const MOCK_USER = {
  id: 'e1111111-1111-1111-1111-111111111111',
  email: 'admin@glamstudio.com',
  user_metadata: {
    nombre: 'Sofía Valenzuela',
    rol: 'admin'
  }
};

function getDb() {
  if (typeof window === 'undefined') {
    return { clientes: [], citas: [], servicios_realizados: [], cobros: [], historial_estilismo: [] };
  }
  
  let data = localStorage.getItem(DB_KEY);
  if (!data) {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const initialDb = {
      clientes: [
        {
          id: "b1111111-1111-1111-1111-111111111111",
          nombre: "Valeria Gómez Ruiz",
          fecha_nacimiento: "1993-06-15",
          telefono: "686-555-0101",
          email: "valeria.gomez@gmail.com",
          direccion: "Av. de los Pinos 450",
          colonia: "Alamitos",
          notas_preferencias: "Cabello fino, propenso a resecarse. Prefiere tintes sin amoniaco. Tono habitual: Castaño Claro Dorado (5.3).",
          activo: true
        },
        {
          id: "b2222222-2222-2222-2222-222222222222",
          nombre: "Gabriela Luján Ríos",
          fecha_nacimiento: "1989-11-03",
          telefono: "686-555-0202",
          email: "gaby.lujan@outlook.com",
          direccion: "Calle del Sol 23",
          colonia: "Jardines del Valle",
          notas_preferencias: "Cabello abundante, chino. Le gusta volumen. Se realiza Balayage rubio cenizo cada 4 meses.",
          activo: true
        },
        {
          id: "b3333333-3333-3333-3333-333333333333",
          nombre: "Mónica Salazar Ortiz",
          fecha_nacimiento: "1978-02-28",
          telefono: "686-555-0303",
          email: "monica_salazar@yahoo.com",
          direccion: "Paseo de la Reforma 890",
          colonia: "San Marcos",
          notas_preferencias: "Sensibilidad en cuero cabelludo. Requiere champú dermatológico. Suele realizarse Manicura y Pedicura Spa.",
          activo: true
        },
        {
          id: "b4444444-4444-4444-4444-444444444444",
          nombre: "Carolina Herrera Peña",
          fecha_nacimiento: "2001-08-19",
          telefono: "686-555-0404",
          email: "cherrera@gmail.com",
          direccion: "Av. Benito Juárez 1205",
          colonia: "Centro",
          notas_preferencias: "Cabello lacio, largo. Acude para hidratación profunda y despunte. Alérgica a fragancias fuertes.",
          activo: true
        },
        {
          id: "b5555555-5555-5555-5555-555555555555",
          nombre: "Beatriz Domínguez Silva",
          fecha_nacimiento: "1965-04-12",
          telefono: "686-555-0505",
          email: "bety.dom@gmail.com",
          direccion: "Calzada de las Américas 80",
          colonia: "Prohogar",
          notas_preferencias: "Corte Bob corto habitual. Cobertura de canas al 100%. Tono habitual: Castaño Oscuro (3.0).",
          activo: true
        }
      ],
      citas: [
        {
          id: "c1111111-1111-1111-1111-111111111111",
          cliente_id: "b1111111-1111-1111-1111-111111111111",
          fecha: todayStr,
          hora: "09:00:00",
          servicio: "Corte y Secado Premium",
          estado: "completada",
          notas: "Desea corte en capas medias con volumen",
          recordatorio_enviado: true
        },
        {
          id: "c2222222-2222-2222-2222-222222222222",
          cliente_id: "b2222222-2222-2222-2222-222222222222",
          fecha: todayStr,
          hora: "10:30:00",
          servicio: "Retoque de Raíz e Hidratación",
          estado: "completada",
          notas: "Usar tinte sin amoniaco INOA",
          recordatorio_enviado: true
        },
        {
          id: "c3333333-3333-3333-3333-333333333333",
          cliente_id: "b3333333-3333-3333-3333-333333333333",
          fecha: todayStr,
          hora: "12:00:00",
          servicio: "Manicura y Pedicura Spa",
          estado: "confirmada",
          notas: "Esmaltado en gel semipermanente",
          recordatorio_enviado: true
        },
        {
          id: "c4444444-4444-4444-4444-444444444444",
          cliente_id: "b4444444-4444-4444-4444-444444444444",
          fecha: todayStr,
          hora: "14:00:00",
          servicio: "Diseño de Ceja y Laminado",
          estado: "confirmada",
          notas: "Diseño con hilo y depilación con cera suave",
          recordatorio_enviado: true
        },
        {
          id: "c5555555-5555-5555-5555-555555555555",
          cliente_id: "b5555555-5555-5555-5555-555555555555",
          fecha: todayStr,
          hora: "15:30:00",
          servicio: "Corte de Cabello y Tinte Global",
          estado: "sin_confirmar",
          notas: "Requiere cobertura de canas rebeldes",
          recordatorio_enviado: false
        },
        {
          id: "c6666666-6666-6666-6666-666666666666",
          cliente_id: "b1111111-1111-1111-1111-111111111111",
          fecha: todayStr,
          hora: "17:00:00",
          servicio: "Tratamiento Keratina Alaciante",
          estado: "no_show",
          notas: "Cliente canceló a última hora",
          recordatorio_enviado: true
        },
        {
          id: "c7777777-7777-7777-7777-777777777777",
          cliente_id: "b2222222-2222-2222-2222-222222222222",
          fecha: todayStr,
          hora: "18:30:00",
          servicio: "Peinado y Maquillaje Social",
          estado: "sin_confirmar",
          notas: "Evento formal por la noche",
          recordatorio_enviado: false
        }
      ],
      servicios_realizados: [
        {
          id: "f1111111-1111-1111-1111-111111111111",
          cliente_id: "b1111111-1111-1111-1111-111111111111",
          nombre: "Corte Premium y Tratamiento de Brillo",
          costo_total: 850.00,
          fecha: "2026-05-01",
          activo: true,
          notas: "Tratamiento de colágeno sellante."
        },
        {
          id: "f2222222-2222-2222-2222-222222222222",
          cliente_id: "b3333333-3333-3333-3333-333333333333",
          nombre: "Esmaltado Semipermanente y Pedicura Gel",
          costo_total: 750.00,
          fecha: "2026-05-15",
          activo: true,
          notas: "Decoración a mano alzada en dos uñas."
        },
        {
          id: "f3333333-3333-3333-3333-333333333333",
          cliente_id: "b4444444-4444-4444-4444-444444444444",
          nombre: "Paquete Cambio de Look Completo (Balayage)",
          costo_total: 2900.00,
          fecha: "2026-01-10",
          activo: true,
          notas: "Deco de base, matiz y corte bob."
        },
        {
          id: "f4444444-4444-4444-4444-444444444444",
          cliente_id: "b2222222-2222-2222-2222-222222222222",
          nombre: "Retoque de Tinte e Hidratación Profunda",
          costo_total: 1200.00,
          fecha: todayStr,
          activo: false,
          notas: "Completado hoy con éxito."
        }
      ],
      cobros: [
        {
          id: "cob1",
          cliente_id: "b1111111-1111-1111-1111-111111111111",
          servicio_realizado_id: "f1111111-1111-1111-1111-111111111111",
          monto: 500.00,
          fecha: "2026-05-01",
          metodo_pago: "efectivo",
          notes: "Abono inicial",
          created_at: "2026-05-01T10:00:00Z"
        },
        {
          id: "cob2",
          cliente_id: "b1111111-1111-1111-1111-111111111111",
          servicio_realizado_id: "f1111111-1111-1111-1111-111111111111",
          monto: 350.00,
          fecha: "2026-05-15",
          metodo_pago: "transferencia",
          notes: "Liquidación corte y tratamiento",
          created_at: "2026-05-15T10:00:00Z"
        },
        {
          id: "cob3",
          cliente_id: "b3333333-3333-3333-3333-333333333333",
          servicio_realizado_id: "f2222222-2222-2222-2222-222222222222",
          monto: 750.00,
          fecha: "2026-05-15",
          metodo_pago: "tarjeta",
          notes: "Pago total con tarjeta de crédito",
          created_at: "2026-05-15T11:00:00Z"
        },
        {
          id: "cob4",
          cliente_id: "b4444444-4444-4444-4444-444444444444",
          servicio_realizado_id: "f3333333-3333-3333-3333-333333333333",
          monto: 1500.00,
          fecha: "2026-01-10",
          metodo_pago: "tarjeta",
          notes: "Enganche de paquete Balayage",
          created_at: "2026-01-10T12:00:00Z"
        },
        {
          id: "cob5",
          cliente_id: "b4444444-4444-4444-4444-444444444444",
          servicio_realizado_id: "f3333333-3333-3333-3333-333333333333",
          monto: 700.00,
          fecha: "2026-02-10",
          metodo_pago: "transferencia",
          notes: "Segundo abono",
          created_at: "2026-02-10T10:00:00Z"
        },
        {
          id: "cob6",
          cliente_id: "b4444444-4444-4444-4444-444444444444",
          servicio_realizado_id: "f3333333-3333-3333-3333-333333333333",
          monto: 700.00,
          fecha: "2026-03-10",
          metodo_pago: "transferencia",
          notes: "Liquidación de servicio",
          created_at: "2026-03-10T10:00:00Z"
        },
        {
          id: "cob9",
          cliente_id: "b2222222-2222-2222-2222-222222222222",
          servicio_realizado_id: "f4444444-4444-4444-4444-444444444444",
          monto: 1200.00,
          fecha: todayStr,
          metodo_pago: "efectivo",
          notes: "Pago del día",
          created_at: todayStr + "T10:00:00Z"
        }
      ],
      historial_estilismo: [
        {
          id: "exp1",
          cliente_id: "b1111111-1111-1111-1111-111111111111",
          cita_id: "c1111111-1111-1111-1111-111111111111",
          fecha: todayStr,
          detalles_trabajo: "Corte estilo Bob angulado con degrafilado ligero. Aplicación de mascarilla reparadora Kerastase de 10 min. Secado natural con cepillo redondo.",
          estilista: "Sofía Valenzuela",
          archivo_url: null,
          created_at: todayStr + "T09:00:00Z"
        },
        {
          id: "exp2",
          cliente_id: "b2222222-2222-2222-2222-222222222222",
          cita_id: "c2222222-2222-2222-2222-222222222222",
          fecha: todayStr,
          detalles_trabajo: "Retoque de raíces con Majirel L'Oreal tono 5.3 + Oxidante 20 Vol. Tiempo de pose de 35 minutos. Lavado con champú protector de color.",
          estilista: "Daniela Ortiz",
          archivo_url: null,
          created_at: todayStr + "T10:30:00Z"
        },
        {
          id: "exp3",
          cliente_id: "b4444444-4444-4444-4444-444444444444",
          cita_id: null,
          fecha: "2026-01-10",
          detalles_trabajo: "Técnica Balayage con decolorante Blond Studio 9 + 30 Vol. Matiz con Dialight 9.12 + revelador 9 Vol. Tratamiento post-decoloración Smartbond.",
          estilista: "Sofía Valenzuela",
          archivo_url: null,
          created_at: "2026-01-10T12:00:00Z"
        }
      ]
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  return JSON.parse(data);
}

function saveDb(db) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

class MockQuery {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orders = [];
    this.limitVal = null;
    this.isSingle = false;
    this.selectColumns = '*';
  }

  select(columns) {
    this.selectColumns = columns || '*';
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  gt(column, value) {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  gte(column, value) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lt(column, value) {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  lte(column, value) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  order(column, options = {}) {
    this.orders.push({ column, ascending: options.ascending !== false });
    return this;
  }

  limit(value) {
    this.limitVal = value;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled, onrejected) {
    try {
      const res = await this.execute();
      return onfulfilled ? onfulfilled(res) : res;
    } catch (e) {
      if (onrejected) return onrejected(e);
      throw e;
    }
  }

  async execute() {
    const db = getDb();
    let rows = JSON.parse(JSON.stringify(db[this.table] || []));

    // Apply filters
    for (const f of this.filters) {
      if (f.type === 'eq') {
        rows = rows.filter(r => r[f.column] === f.value);
      } else if (f.type === 'neq') {
        rows = rows.filter(r => r[f.column] !== f.value);
      } else if (f.type === 'gt') {
        rows = rows.filter(r => r[f.column] > f.value);
      } else if (f.type === 'gte') {
        rows = rows.filter(r => r[f.column] >= f.value);
      } else if (f.type === 'lt') {
        rows = rows.filter(r => r[f.column] < f.value);
      } else if (f.type === 'lte') {
        rows = rows.filter(r => r[f.column] <= f.value);
      }
    }

    // Apply orders
    for (const ord of this.orders) {
      rows.sort((a, b) => {
        const valA = a[ord.column];
        const valB = b[ord.column];
        if (valA < valB) return ord.ascending ? -1 : 1;
        if (valA > valB) return ord.ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitVal !== null) {
      rows = rows.slice(0, this.limitVal);
    }

    if (this.isUpdate) {
      const dbAll = getDb();
      const allRows = dbAll[this.table] || [];
      const matchingIds = new Set(rows.map(r => r.id));
      const updatedRecords = [];
      dbAll[this.table] = allRows.map(r => {
        if (matchingIds.has(r.id)) {
          const updated = { ...r, ...this.updateData };
          updatedRecords.push(updated);
          return updated;
        }
        return r;
      });
      saveDb(dbAll);
      return { data: updatedRecords, error: null };
    }

    if (this.isDelete) {
      const dbAll = getDb();
      const allRows = dbAll[this.table] || [];
      const matchingIds = new Set(rows.map(r => r.id));
      dbAll[this.table] = allRows.filter(r => !matchingIds.has(r.id));
      saveDb(dbAll);
      return { data: rows, error: null };
    }

    const parsedCols = this.parseSelect(this.selectColumns);

    let finalRows = rows.map(row => {
      const newRow = {};
      
      // Copy explicit columns if specified (and not wildcard '*')
      if (parsedCols.wildcard) {
        Object.assign(newRow, row);
      } else {
        parsedCols.columns.forEach(col => {
          newRow[col] = row[col];
        });
      }

      // Add expanded relations (joins)
      parsedCols.relations.forEach(rel => {
        const relTable = rel.table;
        const relCols = rel.columns;

        if (relTable === 'clientes' && row.cliente_id) {
          const cli = db.clientes.find(c => c.id === row.cliente_id);
          if (cli) {
            newRow.clientes = relCols.includes('*') ? cli : this.projectObj(cli, relCols);
          } else {
            newRow.clientes = null;
          }
        } else if (relTable === 'cobros') {
          if (this.table === 'servicios_realizados') {
            const cobs = db.cobros.filter(c => c.servicio_realizado_id === row.id);
            newRow.cobros = cobs.map(c => relCols.includes('*') ? c : this.projectObj(c, relCols));
          } else {
            newRow.cobros = [];
          }
        } else if (relTable === 'servicios_realizados' && row.servicio_realizado_id) {
          const serv = db.servicios_realizados.find(s => s.id === row.servicio_realizado_id);
          if (serv) {
            newRow.servicios_realizados = relCols.includes('*') ? serv : this.projectObj(serv, relCols);
          } else {
            newRow.servicios_realizados = null;
          }
        }
      });

      return newRow;
    });

    if (this.isSingle) {
      return { data: finalRows[0] || null, error: null };
    }

    return { data: finalRows, error: null };
  }

  projectObj(obj, cols) {
    const res = {};
    cols.forEach(c => {
      res[c] = obj[c];
    });
    return res;
  }

  parseSelect(selStr) {
    const result = { wildcard: false, columns: [], relations: [] };
    const str = selStr.replace(/\s+/g, ' ');
    
    if (str.includes('*')) {
      result.wildcard = true;
    }

    const relRegex = /(\w+)\(([^)]+)\)/g;
    let match;
    const relationNames = [];
    while ((match = relRegex.exec(str)) !== null) {
      const table = match[1];
      const cols = match[2].split(',').map(s => s.trim());
      result.relations.push({ table, columns: cols });
      relationNames.push(match[0]);
    }

    if (!result.wildcard) {
      let plainPart = str;
      relationNames.forEach(rn => {
        plainPart = plainPart.replace(rn, '');
      });
      result.columns = plainPart
        .split(',')
        .map(s => s.trim())
        .filter(s => s && !s.includes('(') && !s.includes(')'));
    }

    return result;
  }

  async insert(data) {
    const db = getDb();
    const records = Array.isArray(data) ? data : [data];
    const newRecords = records.map(r => {
      const copy = { ...r };
      if (!copy.id) {
        copy.id = Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      }
      if (!copy.created_at) {
        copy.created_at = new Date().toISOString();
      }
      return copy;
    });

    db[this.table] = [...(db[this.table] || []), ...newRecords];
    saveDb(db);

    return { data: Array.isArray(data) ? newRecords : newRecords[0], error: null };
  }

  update(data) {
    this.updateData = data;
    this.isUpdate = true;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }
}

export const mockSupabase = {
  auth: {
    async getSession() {
      if (typeof window === 'undefined') return { data: { session: null }, error: null };
      const loggedIn = localStorage.getItem('estetica_mock_logged_in') !== 'false';
      if (!loggedIn) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            user: MOCK_USER,
            access_token: 'mock-token',
          }
        },
        error: null
      };
    },
    onAuthStateChange(callback) {
      if (typeof window === 'undefined') {
        return { data: { subscription: { unsubscribe() {} } } };
      }
      globalListeners.push(callback);
      
      const loggedIn = localStorage.getItem('estetica_mock_logged_in') !== 'false';
      const session = loggedIn ? { user: MOCK_USER } : null;
      setTimeout(() => callback('SIGNED_IN', session), 0);

      return {
        data: {
          subscription: {
            unsubscribe() {
              globalListeners = globalListeners.filter(cb => cb !== callback);
            }
          }
        }
      };
    },
    async signInWithPassword({ email, password }) {
      if (email && password) {
        localStorage.setItem('estetica_mock_logged_in', 'true');
        const session = { user: { ...MOCK_USER, email } };
        globalListeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user: session.user, session }, error: null };
      }
      return { data: null, error: { message: 'Credenciales inválidas en modo simulación' } };
    },
    async signOut() {
      localStorage.setItem('estetica_mock_logged_in', 'false');
      globalListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    }
  },
  
  from(table) {
    return new MockQuery(table);
  },
  
  storage: {
    from(bucket) {
      return {
        async upload(path, file) {
          return { data: { path }, error: null };
        },
        getPublicUrl(path) {
          // Retorna una foto de estilismo premium de prueba
          return { data: { publicUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80' } };
        },
        async remove(paths) {
          return { data: paths, error: null };
        }
      };
    }
  }
};
