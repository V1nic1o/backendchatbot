# Imagen base
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto (puede ajustarse con .env)
EXPOSE 3000

# Comando para ejecutar la app en modo producción
CMD ["node", "index.js"]
