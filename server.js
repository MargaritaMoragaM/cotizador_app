// server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

// Inicialización la aplicación Express
const app = express();
const PORT = 3000;

// Middleware para permitir solicitudes desde otros orígenes (frontend)
app.use(cors());

// Middleware para interpretar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public" (frontend)
app.use(express.static("public"));

/**
 * Ruta POST para enviar el correo con la cotización.
 * Recibe en el cuerpo JSON: { email, contenido }
 */
app.post("/enviar-correo", async (req, res) => {
  const { email, contenido } = req.body;

  // Configuración del transporte SMTP usando Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "preubacotizador01@gmail.com",  // Correo real
      pass: "rtoywezygurmwczp",               // Password de aplicación
    },
  });

  try {
    // Enviar correo
    await transporter.sendMail({
      from: '"Cotizador App" <preubacotizador01@gmail.com>', // Remitente visible
      to: email,                                                // Destinatario (cliente)
      subject: "Cotización solicitada",                         // Asunto
      // Enviar el contenido con formato HTML para mejor presentación
      html: `<div style="font-family: Arial, sans-serif; font-size: 14px;">
               <h2>Cotización de Servicios</h2>
               <p>${contenido.replace(/\n/g, "<br>")}</p>
             </div>`,
    });

    // Respuesta exitosa al cliente
    res.json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    // En caso de error, se loguea y se responde con código 500
    console.error("Error al enviar correo:", error);
    res.status(500).json({ message: "Error al enviar el correo", error });
  }
});

// Iniciar servidor en el puerto configurado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
