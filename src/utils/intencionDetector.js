// src/utils/intencionDetector.js

const opcionesNumericas = {
    '1': 'promociones', 'uno': 'promociones',
    '2': 'catalogo', 'dos': 'catalogo',
    '3': 'ubicacion', 'tres': 'ubicacion',
    '4': 'contacto', 'cuatro': 'contacto',
};

const patronesPorContexto = {
    promociones: /(promo|promos|promoción|promociones|oferta|ofertas|🎁)/i,
    catalogo: /(catálogo|productos|ver catálogo|mostrar productos|pasame el catálogo)/i,
    ubicacion: /(ubicación|dónde están|cómo llegar|ver estantes|dirección|dónde puedo ir)/i,
    contacto: /(hablar con alguien|asesor|necesito ayuda|quiero hablar|me pueden llamar|contacto)/i,
    precio: /(precio|cuánto sale|cuánto cuesta|valor|me decís el precio)/i
};

const detectarContexto = (texto) => {
    const normalizado = texto?.toLowerCase().trim();
    if (opcionesNumericas[normalizado]) return opcionesNumericas[normalizado];

    for (const [clave, patron] of Object.entries(patronesPorContexto)) {
        if (patron.test(normalizado)) return clave;
    }

    return normalizado;
};

module.exports = { detectarContexto };
