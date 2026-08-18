"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setMensaje(
          "Registro realizado correctamente. Revisa tu correo electrónico para confirmar tu cuenta."
        );
      }
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error durante el registro.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main>
      <h1>Crear cuenta</h1>

      <form onSubmit={handleRegistro}>
        <div>
          <label htmlFor="nombre">Nombre</label>

          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Correo electrónico</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}

      {error && <p>{error}</p>}
    </main>
  );
}