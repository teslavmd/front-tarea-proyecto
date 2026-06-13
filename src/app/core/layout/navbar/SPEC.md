# feat(core): implementación de Navbar responsivo y gestión de sesión visual

## Descripción
Esta PR incorpora el componente estructural `NavbarComponent` que actúa como cabecera global de la aplicación. Gestiona la visibilidad basada en el contexto de enrutamiento (oculto en flujos de autenticación), el diseño responsivo (Desktop/Mobile) y la decodificación en tiempo real del token JWT para la visualización del usuario activo.

---

## 1. Decisiones de Arquitectura
* **Ubicación:** El componente se alojó dentro del módulo `Core` (ej. `src/app/core/components/navbar/`) en lugar de `Features`, ya que es un elemento estructural `Singleton` que envuelve a toda la aplicación y no pertenece a un dominio de negocio específico (como Proyectos o Tareas).
* **Gestión de Estado:** Se implementó el uso de Signals (`signal()`) nativos de Angular para el manejo reactivo del usuario logueado y la visibilidad de la barra.

---

## 2. Contrato de Seguridad (Modificación del JWT)
Para soportar la visualización del nombre real del usuario en el frontend sin requerir llamadas HTTP adicionales, se modificó el payload del token firmado por el backend (Spring Boot):
* Se extendió la clase `CustomUserDetails` para exponer el dominio subyacente.
* En `JwtService.java`, se inyectó un *Custom Claim* llamado `"name"` durante la generación del token (`Jwts.builder().setClaims(extraClaims)`).

---

## 3. Criterios de Aceptación

**Escenario 1: Renderizado responsivo en Desktop**  
**Dado** que el usuario está autenticado en la aplicación  
**Cuando** visualiza la interfaz en una pantalla con resolución mayor a 768px  
**Entonces** el Navbar renderiza el nombre y correo del usuario de forma explícita  
**Y** muestra un botón de "Salir" visible en la cabecera 

**Escenario 2: Renderizado responsivo en Mobile**  
**Dado** que el usuario está autenticado en la aplicación  
**Cuando** visualiza la interfaz en una pantalla con resolución menor o igual a 768px  
**Entonces** la información del usuario y el botón de salida se ocultan  
**Y** se renderiza un botón "Menú Hamburguesa" que despliega estos datos mediante un `MatMenu`  

**Escenario 3: Ocultamiento dinámico en flujos públicos**    
**Dado** que el usuario navega a cualquier ruta pública bajo el segmento `/auth` (ej. Login)  
**Cuando** el `Router` finaliza la navegación (`NavigationEnd`)  
**Entonces** el Navbar detecta la ruta  
**Y** oculta completamente la cabecera para no interferir con el diseño del formulario  

**Escenario 4: Reacción al logueo y decodificación de JWT**  
**Dado** que el usuario completa el formulario de login exitosamente  
**Cuando** la aplicación lo redirige de `/auth/login` hacia `/projects`  
**Entonces** el Navbar intercepta el evento de enrutamiento  
**Y** lee asíncronamente el nuevo token JWT almacenado  
**Y** renderiza inmediatamente los datos del usuario sin requerir recarga de la página (F5)  

**Escenario 5: Cierre de sesión**  
**Dado** que el usuario presiona la acción de "Cerrar Sesión" / "Salir"  
**Cuando** el componente procesa el evento  
**Entonces** se purga el token de seguridad del almacenamiento local  
**Y** se limpia la variable de estado reactivo (`user.set(null)`)  
**Y** el sistema redirige al usuario hacia la vista de login  

---

## 4. Notas Técnicas y Resolución de Problemas (Debugging)

1. **Ausencia del Nombre en el Token JWT:** Inicialmente, el Navbar renderizaba el correo en el lugar del nombre debido a que el backend solo incluía los claims estándar (como `sub`). **Solución:** Se implementó una modificación en el adaptador de seguridad de Spring Boot, exponiendo el atributo mediante `CustomUserDetails` e inyectándolo en la configuración de claims del `JwtService`.
2. **Ciclo de vida en redirección post-login:** Al ingresar a la plataforma, el Navbar se mostraba vacío debido a que su `ngOnInit` se ejecutó durante la vista previa de login (cuando el localStorage aún no tenía token). **Solución:** Se refactorizó la lógica hacia una suscripción reactiva utilizando `router.events` filtrado por `NavigationEnd`, forzando la decodificación del token vía `jwt-decode` de forma dinámica tras cada redirección exitosa.

---

## 5. Registro de Prompts e Implementación Técnica (SDD Log)


* ***Iteración 1: Estructura base responsiva**  
**Prompt Original:** *"actua como un desarrollador angular senior, y generame un navbar component (responsive) que tenga a la derecha el nombre, correo y botón de log-out, en pantallas mayores a 768px,y en pantallas chicas menores o igual a 768px que tenga un hamburguer-btn..."*  
**Resolución Técnica:** Se generó el componente standalone `NavbarComponent` utilizando Angular Material (`MatToolbar`, `MatMenu`). Se aplicaron media queries CSS puros para alternar entre el menú expandido y el botón hamburguesa sin sobrecargar el componente con el `BreakpointObserver`.


* **Iteración 2: Interfaz con el JWT**  
**Prompt Original:** *"Actua como un desarrollador full-stack (Angular-Spring) senior, necesito decodificar mi payload-jwt para poder extrar los claims 'name' y 'sub'. Tambien adjunto capturas de mi codigo back-end de mi JwtService.java*  
**Resolución Técnica:** Se integró la librería `jwt-decode` para inspeccionar el payload base64 en el frontend. Se diagnosticó mediante debugging que el backend solo estaba emitiendo el *Subject* (`sub`), requiriendo una intervención full-stack.  

* **Iteración 3: Bugfix Frontend - Ciclo de Vida**  
**Prompt Original:** *"cuando hago un loggeo y me redirige a `../projects`, el nombre y mi correo no aparecen en el navbar, pero cuando hago refresh sí, ésto se debe a que mi `navbar-component.ts` (ngOnInit()) se carga globalmente con la aplicación incluso en las rutas de autenticacion? "*  
**Resolución Técnica:** Resolución de condición de carrera. Se trasladó la lectura del `AuthService` desde el `ngOnInit` (que no se re-disparaba) hacia el bloque reactivo del `NavigationEnd` dentro del constructor, garantizando que el estado Signals se hidrate con la sesión actual independientemente de las recargas duras del navegador.
