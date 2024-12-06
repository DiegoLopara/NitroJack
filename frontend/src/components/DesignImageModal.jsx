import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Flex,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { BiBrush } from "react-icons/bi";

const DesignImageModal = ({ onDesignSubmit }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [strokeColor, setStrokeColor] = useState("black");
  const canvasRef = useState(null);

  // Maneja la carga de la imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result); // Establecer la URL de la imagen cargada
        setStrokeColor(detectImageBrightness(reader.result)); // Cambiar color del pincel según la imagen
      };
      reader.readAsDataURL(file);
    }
  };

  // Detecta el brillo promedio de la imagen
  const detectImageBrightness = (imageUrl) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Crear un canvas temporal para procesar la imagen
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Obtener los datos de los píxeles de la imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let totalBrightness = 0;
      const numPixels = pixels.length / 4; // Cada píxel tiene 4 valores (R, G, B, A)

      // Calcular el brillo promedio de los píxeles
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]; // Rojo
        const g = pixels[i + 1]; // Verde
        const b = pixels[i + 2]; // Azul

        // Fórmula para el brillo: promedio ponderado de los canales RGB
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalBrightness += brightness;
      }

      const averageBrightness = totalBrightness / numPixels;

      // Si el brillo promedio es mayor que un umbral, usamos un pincel oscuro, de lo contrario blanco
      if (averageBrightness > 128) {
        setStrokeColor("black"); // Imagen clara, pincel negro
      } else {
        setStrokeColor("white"); // Imagen oscura, pincel blanco
      }
    };
    return strokeColor;
  };

  // Función para guardar el diseño
  const handleSaveDesign = async () => {
    setLoading(true);
    try {
      const exportData = await canvasRef.current.exportImage("png");
      onDesignSubmit(exportData); // Pasa la imagen diseñada al componente padre
      onClose();
    } catch (error) {
      console.error("Error al guardar el diseño", error);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar el canvas
  const handleClearCanvas = () => {
    canvasRef.current.clearCanvas();
  };

  return (
    <>
      <IconButton
        icon={<BiBrush />} // Ícono de diseño
        aria-label="Diseñar Imagen"
        colorScheme="teal"
        size="md"
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Diseñar Imagen</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Mostrar la imagen cargada en el lienzo */}
            <ReactSketchCanvas
              style={{ border: "1px solid #000", borderRadius: "5px" }}
              width="100%"
              height="400px"
              strokeWidth={4}
              strokeColor={strokeColor} // Utilizar el color del pincel dinámico
              ref={canvasRef}
              backgroundImage={imageUrl} // Configura la imagen de fondo en el lienzo
            />
            {/* Entrada para cargar imágenes */}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              mt={3}
            />
          </ModalBody>

          <ModalFooter>
            <Flex justifyContent="space-between" width="100%">
              <Button colorScheme="red" onClick={handleClearCanvas}>
                Limpiar
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSaveDesign}
                isLoading={loading}
              >
                Guardar Diseño
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DesignImageModal;
