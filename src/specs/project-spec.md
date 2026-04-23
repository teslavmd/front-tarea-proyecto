# Especificación de Requerimientos: Feature de Proyectos

## 1. Contexto y Modelado de Datos
La feature de proyectos permite la creación, consulta y actualización de estado de los proyectos. Siguiendo Clean Architecture, el frontend actúa consumiendo los adaptadores de entrada (DTOs) de la API REST sin conocimiento de la capa de infraestructura o dominio interno de Spring Boot.

## 6. Registro de Prompts (SDD Log)

**Iteración 1: Models y ProjectService**
> Actúa como un desarrollador Senior en Angular. A partir de la firma de mis endpoints en Spring Boot (@PostMapping("/projects") para crear, @GetMapping("/projects/{id}") para consultar, y @PostMapping("/projects/{id}/status") para cambiar estado) y mis DTOs (CreateProjectRequestDTO, ProjectResponseDTO, ChangeProjectStatusRequestDTO), genera las interfaces TypeScript correspondientes y el ProjectService utilizando HttpClient.