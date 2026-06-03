## Auth Specification (Frontend)

### 1. Requerimientos Funcionales
* **Login:** Formulario para capturar `email` y `password`.
* **Registro:** Formulario para capturar `nombre`, `email` y `password`.
* **Persistencia:** El sistema debe almacenar el JWT en `localStorage` para mantener la sesión activa al recargar la página.
* **Protección de Rutas:** Impedir acceso a `/dashboard`, `/projects` y `/tasks` si no existe un token válido.
* **Cierre de Sesión:** Eliminar el token y redirigir al `/login`.

### 2. Contrato con el Backend (API)
Basado en la configuración actual (Docker):
* **Base URL:** `http://localhost:8080/api/v1/auth`
* **Endpoints:**
    * `POST /register`: Recibe `RegisterRequest`, devuelve `AuthResponse`.
    * `POST /login`: Recibe `LoginRequest`, devuelve `AuthResponse`.

### 3. Manejo de Estado (AuthService)
El servicio debe exponer:
* Un `Observable` (preferiblemente un `BehaviorSubject`) que indique si el usuario está autenticado.
* Método `getToken()` para obtener el string del token.
* Método `logout()` para limpiar el almacenamiento.

### 4. Flujo de Intercepción (Interceptor)
* **Header:** `Authorization: Bearer {token}`
* **Condición:** Solo adjuntar el header si el token existe en `localStorage`.
* **Manejo de Errores:** Si el backend devuelve un **401 Unauthorized** (token expirado), el interceptor debe forzar el `logout()`.

---

### 5. Definición de Rutas (Angular Router)
| Ruta | Componente | Acceso | Guard |
| :--- | :--- | :--- | :--- |
| `/login` | LoginComponent | Público | - |
| `/register` | RegisterComponent | Público | - |
| `/projects` | ProjectListComponent | Privado | `AuthGuard` |
| `/projects/new` | ProjectFormComponent | Privado | `AuthGuard` |
| `/tasks` | TaskListComponent | Privado | `AuthGuard` |



### 6. Prompts Utilizados

**Iteración 1: AuthService (Base de autenticación)**
> Actúa como un desarrollador Senior en Angular. Basado en el auth-spec.md que definimos y que tienes en contexto, vamos a empezar a construir la feature de autenticación paso a paso. Empecemos exclusivamente por el Paso 1: El AuthService. Necesito que me generes el código para auth.service.ts. Asegúrate de usar las mejores prácticas, tipar correctamente las interfaces de entrada y salida (coincidiendo con los DTOs LoginRequest y AuthResponse de nuestro backend en Spring Boot), y usar HttpClient para las peticiones. El servicio debe manejar el guardado del token en localStorage y exponer el estado de autenticación usando un BehaviorSubject. Explícame detalladamente qué hace cada parte y por qué tomaste esas decisiones, ya que necesito comprenderlo a fondo para defenderlo en la revisión del PR.

**Iteración 2: LoginComponent (Interfaz gráfica y estado)**
> Actúa como un desarrollador Senior en Angular. Siguiendo con el auth-spec.md, vamos a implementar el LoginComponent. Requisitos: Usa Angular Material. Usa Reactive Forms con validaciones (email requerido y con formato válido, password requerido con mínimo 6 caracteres). Inyecta el AuthService que creamos antes para procesar el login. Maneja el estado de carga (un spinner o deshabilitar el botón mientras se procesa). Si el login es exitoso, redirige al /projects. Si falla, muestra un mensaje de error. Genera el código del TS, el HTML y el CSS (si es necesario). Explícame cómo funcionan las validaciones reactivas y la suscripción al servicio, ya que debo explicarlo en la revisión del PR.

**Iteración 3: RegisterComponent (Nota: Surgió por observación manual)**
> El componente de registro fue desarrollado siguiendo la misma arquitectura base del LoginComponent (Reactive Forms + Material Design), agregando la lógica de validación para el campo 'nombre' y manejando el flujo de error específico para cuentas duplicadas.

**Iteración 4: AuthGuard (Protección de rutas)**
> Actúa como un desarrollador Senior en Angular. Nuestro LoginComponent ya funciona perfecto. Siguiendo el auth-spec.md, ahora vamos a implementar el AuthGuard (Paso 3). Genera el código para un Guard funcional (estilo Angular moderno con CanActivateFn) que proteja nuestras rutas privadas (/projects, /tasks). Debe inyectar el AuthService y el Router. Si el usuario tiene un token válido, lo deja pasar. Si no, lo redirige a /login. Explícame brevemente cómo funciona bajo el capó la inyección en funciones y cómo debo registrar este Guard en mi archivo app.routes.ts para defenderlo en el PR.

**Iteración 5: JWT Interceptor (Inyección de token en peticiones)**
> Actúa como un desarrollador Senior en Angular. Ya tenemos nuestro AuthService y los componentes visuales listos. Siguiendo el Paso 4 de nuestro auth-spec.md, vamos a implementar el Interceptor JWT. Genera el código de jwt.interceptor.ts utilizando la nueva sintaxis funcional de Angular (HttpInterceptorFn). El interceptor debe obtener el token desde el AuthService, clonar la petición para inyectar el header Authorization: Bearer {token}, y manejar los errores (por ejemplo, si el backend devuelve un error 401, debe forzar el cierre de sesión usando el método logout() del servicio). Explícame cómo funciona la inyección funcional en los interceptores y cómo debo registrar este interceptor en el archivo app.config.ts de mi aplicación Standalone para poder defenderlo en la revisión.


### ✅ Checklist de Verificación Manual
* [x] **Flujo feliz:** El usuario puede registrarse e iniciar sesión exitosamente, recibiendo el token JWT y siendo redirigido a `/projects`.
* [x] **Estados de error manejados:** El formulario muestra mensajes de error claros provenientes de la API (ej. "Contraseña incorrecta", "Email ya registrado") sin romper la aplicación.
* [x] **Protección de rutas:** El `AuthGuard` redirige exitosamente a `/login` si se intenta acceder a una ruta privada sin sesión activa.
* [x] **Inyección de Token:** El `JwtInterceptor` adjunta correctamente el header `Authorization: Bearer` en las peticiones salientes y maneja el deslogueo automático si recibe un 401/403 en rutas protegidas.