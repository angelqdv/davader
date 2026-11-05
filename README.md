# ⚡ D.A.V.A.D.E.R. — eFootball Operations Hub

> **D.A.V.A.D.E.R.**: **D**avid **A**nd **V**ader **A**pplications, **D**atabase & **E**football **R**esources  
> **Creador**: David Peñuela  
> **Plataforma**: GitHub Pages (100% Web estática sin dependencias de servidor)

---

## 📌 ¿Qué es D.A.V.A.D.E.R.?

**D.A.V.A.D.E.R.** es el centro integral y portal web creado para centralizar todas las aplicaciones, recursos, indumentarias y herramientas tácticas desarrolladas para el ecosistema **eFootball**:

1. **📊 Gestor de Habilidades Web (`/gestor`)**:
   - Aplicación web oficial en su **Versión Comercial v1.1**.
   - Lista en limpio con equipos 100% personalizables (modal *⚙️ Configurar Equipo* para personalizar nombres, subtítulos y cargar escudos).
   - Control de inventario maestro (41 habilidades), stock disponible en tiempo real, alertas y botón *⬇️ Descontar*.
   - Persistencia local en LocalStorage y soporte de carga/descarga Excel.

2. **👕 Compendio de Uniformes (`/uniformes`)**:
   - Catálogo técnico de equipaciones (Titular, Suplente, Portero y Especiales).
   - Fichas de diseño con paletas RGB, cortes de cuello, pantalones, medias y fórmulas para el editor de eFootball.
   - Visor dinámico conectado a `uniformes.json` para sincronizar fácilmente los kits de tu otra conversación.

3. **💾 Centro de Descargas Desktop (`/descargas`)**:
   - Enlaces a los ejecutables portables oficiales (`Gestor_Habilidades_Comercial_v1.1_Portable.exe`) para Windows 10/11 sin necesidad de instalación.

*(Nota: La ruta `/temas/` se mantiene activa en el proyecto como repositorio maestro de diseño interno, sin exponerse en la navegación pública).*

---

## 🚀 Despliegue en GitHub Pages

Para publicar este sitio bajo tu cuenta de GitHub:

1. **Crear el repositorio en GitHub**:
   - Ve a [github.com/new](https://github.com/new).
   - Nombre recomendado: `davader` (o `davader-hub`).
   - Selecciónalo como **Público**.

2. **Subir el código desde esta carpeta**:
   ```bash
   cd davader
   git init
   git add .
   git commit -m "feat: D.A.V.A.D.E.R. portal inicial con Gestor Web, Uniformes y Descargas"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/davader.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - En tu repositorio de GitHub, entra a **Settings** → **Pages**.
   - En **Build and deployment** > **Branch**, selecciona `main` y la carpeta `/(root)`.
   - Haz clic en **Save**.
   - En 1-2 minutos tu portal estará en vivo en:
     `https://TU_USUARIO.github.io/davader/`

---

## 👕 Cómo Agregar Nuevos Uniformes desde tu Otra Conversación

El módulo de uniformes fue diseñado para que puedas transferir cualquier nuevo diseño con solo editar `uniformes/uniformes.json`:

```json
{
  "id": "mi_nuevo_kit",
  "team": "Darth Vader FC",
  "teamCode": "dv",
  "name": "Nombre de la Equipación",
  "type": "local",
  "season": "2026/2027",
  "creator": "David Peñuela",
  "description": "Detalles del diseño y lore...",
  "primaryColor": "#0c0d12",
  "secondaryColor": "#991b1b",
  "accentColor": "#ffffff",
  "colors": ["#0c0d12", "#991b1b", "#ffffff"],
  "collar": "Cuello en V",
  "shorts": "Negro",
  "socks": "Negro con rojo",
  "tags": ["Darth Vader", "Titular"],
  "formula": "Base: 1/1/1 | Detalles: 153/27/27"
}
```
*Si tienes una imagen o textura generada, puedes colocarla en `assets/` y vincularla directamente.*

---

## 📦 Publicar los Ejecutables `.exe` en GitHub Releases

Para que los usuarios puedan descargar los ejecutables de ~100MB sin sobrecargar el repositorio Git:
1. En tu repositorio, entra en la pestaña lateral **Releases** → **Draft a new release**.
2. Escribe como Tag: `v1.2.1`.
3. Título: `Gestor de Habilidades Personal v1.2.1 Portable`.
4. Arrastra el archivo `Gestor_Habilidades_Personal_v1.2.1_Portable.exe` en la caja de archivos adjuntos.
5. Haz clic en **Publish release**.

---
*D.A.V.A.D.E.R. • Creado por David Peñuela*
