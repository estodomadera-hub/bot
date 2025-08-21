// src/utils/respuestasUtils.js
function esRespuestaImagenPromo(contexto) {
    return (
        contexto?.includes('quiero') ||
        contexto?.includes('me interesa') ||
        contexto?.includes('más info') ||
        contexto?.includes('precio') ||
        contexto?.includes('cuánto')
    );
}

module.exports = { esRespuestaImagenPromo };