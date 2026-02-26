// =====================================================================
// CALCULADORA DE MINUTAS NOTARIALES
// Basada en aranceles notariales (RD 1426/1989)
// Fórmulas extraídas de los módulos: mercantil_macros.js, poderes.js,
// familia.js, inmobiliario.js, legitimaciones.js, testimonios.js, etc.
// =====================================================================

(function () {
    'use strict';

    // ===== CONSTANTES (de constants.js / constantes_formulas_generales.js) =====
    var PESETA_EURO = 166.386;
    var IVA = 0.21;
    var IRPF = 0.15;
    var PROTOCOLO_ELECTRONICO = 9.03;
    var MENSAJERIA = 18.00;
    var SALIDA_NOTARIO_HORA = 18.03;
    var FOLIO_TIMBRADO = 0.15;

    // ===== SUBTIPOS POR CATEGORÍA =====
    var subtipos = {
        inmobiliario: [
            { value: 'COMP', label: 'Compraventa' },
            { value: 'PRES', label: 'Préstamo hipotecario' },
            { value: 'NOSU', label: 'Novación / Subrogación' },
            { value: 'ARRA', label: 'Arras' },
            { value: 'EDCO', label: 'Extinción de condominio' },
            { value: 'OPCO', label: 'Opción de compra' },
            { value: 'OBNU', label: 'Obra nueva' },
            { value: 'DIHO', label: 'División horizontal' }
        ],
        familia: [
            { value: 'PDR', label: 'Pareja de hecho' },
            { value: 'DPE', label: 'Disolución pareja estable' },
            { value: 'MAT', label: 'Matrimonio' },
            { value: 'FEM', label: 'Formalización expediente matrimonial' },
            { value: 'DIV', label: 'Divorcio' },
            { value: 'CAA', label: 'Capitulaciones antes del matrimonio' },
            { value: 'CAD', label: 'Capitulaciones después del matrimonio' },
            { value: 'EMA', label: 'Emancipación' }
        ],
        mercantil: [
            { value: 'CDS', label: 'Constitución de sociedad (SL)' },
            { value: 'TDS', label: 'Transmisión de participaciones' },
            { value: 'EP', label: 'Elevación a público de acuerdos' },
            { value: 'ME', label: 'Modificación de estatutos' },
            { value: 'PJ', label: 'Poder de junta / Acta de junta' },
            { value: 'CPS', label: 'Compraventa de empresa' }
        ],
        poderes: [
            { value: 'P', label: 'Poder personalizado' },
            { value: 'G', label: 'Poder general' },
            { value: 'E', label: 'Poder especial' },
            { value: 'M', label: 'Poder mercantil general' },
            { value: 'S', label: 'Poder preventivo simple' },
            { value: 'R', label: 'Poder preventivo recíproco' },
            { value: 'L', label: 'Poder para pleitos' },
            { value: 'T', label: 'Sustitución de poder' },
            { value: 'A', label: 'Subapoderamiento' },
            { value: 'V', label: 'Revocación de poder' },
            { value: 'N', label: 'Renuncia de poder' },
            { value: 'F', label: 'Ratificación' }
        ],
        sucesiones: [
            { value: 'TABI', label: 'Testamento abierto individual' },
            { value: 'TABM', label: 'Testamento abierto mancomunado' },
            { value: 'HERE', label: 'Herencia' },
            { value: 'ADHE', label: 'Adición de herencia' },
            { value: 'ACNO', label: 'Acta de notoriedad' }
        ],
        legitimaciones: [
            { value: 'LEG', label: 'Legitimación de firmas' }
        ],
        testimonios: [
            { value: 'TEST', label: 'Testimonio de documentos' }
        ],
        actas: [
            { value: 'ASCN', label: 'Acta sin cuantía' },
            { value: 'ANOT', label: 'Acta de notificación' },
            { value: 'APRE', label: 'Acta de presencia' }
        ]
    };

    // Configuración de qué campos mostrar por subtipo
    var camposPorSubtipo = {
        // Inmobiliario - todos necesitan cuantía
        COMP: { cuantia: true, folios: true, fincas: true, salida: true, mensajeria: true, copElec: true,
                labelCuantia: 'Importe total de la compraventa (€)', defFolios: 8, defCS: 3, defCA: 1 },
        PRES: { cuantia: true, folios: true, fincas: true, salida: true, copElec: true,
                labelCuantia: 'Importe del capital concedido (€)', defFolios: 12, defCS: 1, defCA: 1 },
        NOSU: { cuantia: true, folios: true, fincas: true, salida: true, copElec: true,
                labelCuantia: 'Importe subrogado/novado (€)', defFolios: 8, defCS: 1, defCA: 1 },
        ARRA: { cuantia: true, folios: true, fincas: true, salida: true, copElec: true,
                labelCuantia: 'Importe de las arras (€)', defFolios: 6, defCS: 2, defCA: 1 },
        EDCO: { cuantia: true, folios: true, fincas: true, salida: true, copElec: true,
                labelCuantia: 'Importe del inmueble (€)', defFolios: 8, defCS: 3, defCA: 1 },
        OPCO: { cuantia: true, folios: true, fincas: true, salida: true, copElec: true,
                labelCuantia: 'Importe de la opción de compra (€)', defFolios: 6, defCS: 2, defCA: 1 },
        OBNU: { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Valor de la obra nueva (€)', defFolios: 10, defCS: 1, defCA: 1 },
        DIHO: { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Valor de la división (€)', defFolios: 10, defCS: 1, defCA: 1 },
        // Familia - sin cuantía, por folios
        PDR:  { folios: true, salida: true, copElec: true, defFolios: 4, defCS: 1, defCA: 1 },
        DPE:  { folios: true, salida: true, copElec: true, defFolios: 4, defCS: 1, defCA: 1 },
        MAT:  { folios: true, salida: true, copElec: true, defFolios: 7, defCS: 2, defCA: 1 },
        FEM:  { folios: true, salida: true, copElec: true, defFolios: 25, defCS: 1, defCA: 1 },
        DIV:  { folios: true, salida: true, copElec: true, defFolios: 10, defCS: 3, defCA: 2 },
        CAA:  { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Cuantía de las capitulaciones (€)', defFolios: 6, defCS: 2, defCA: 2 },
        CAD:  { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Cuantía de las capitulaciones (€)', defFolios: 8, defCS: 2, defCA: 2 },
        EMA:  { folios: true, salida: true, copElec: true, defFolios: 4, defCS: 1, defCA: 2 },
        // Mercantil
        CDS:  { cuantia: true, folios: true, salida: true, mensajeria: true, copElec: true,
                labelCuantia: 'Capital social (€)', defFolios: 15, defCS: 1, defCA: 1 },
        TDS:  { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Importe de la transmisión (€)', defFolios: 14, defCS: 1, defCA: 1 },
        EP:   { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Capital social (€)', defFolios: 8, defCS: 1, defCA: 1 },
        ME:   { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Capital social (€)', defFolios: 6, defCS: 1, defCA: 1 },
        PJ:   { folios: true, salida: true, copElec: true, defFolios: 8, defCS: 1, defCA: 1 },
        CPS:  { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Importe de la compraventa (€)', defFolios: 10, defCS: 1, defCA: 1 },
        // Poderes - por otorgantes/apoderados y folios
        P:    { otorgantes: true, folios: true, salida: true, mensajeria: true,
                labelOtorgantes: 'Poderdantes', defFolios: 4, defCS: 1, defCA: 1, defOtorg: 1 },
        G:    { otorgantes: true, folios: true, salida: true, mensajeria: true,
                labelOtorgantes: 'Poderdantes', defFolios: 5, defCS: 1, defCA: 1, defOtorg: 1 },
        E:    { otorgantes: true, folios: true, salida: true,
                labelOtorgantes: 'Poderdantes', defFolios: 4, defCS: 1, defCA: 1, defOtorg: 1 },
        M:    { otorgantes: true, folios: true, salida: true,
                labelOtorgantes: 'Poderdantes', defFolios: 5, defCS: 1, defCA: 1, defOtorg: 1 },
        S:    { otorgantes: true, folios: true, salida: true, mensajeria: true,
                labelOtorgantes: 'Poderdantes', defFolios: 6, defCS: 1, defCA: 1, defOtorg: 1 },
        R:    { otorgantes: true, folios: true, salida: true, mensajeria: true,
                labelOtorgantes: 'Poderdantes', defFolios: 8, defCS: 1, defCA: 1, defOtorg: 2 },
        L:    { otorgantes: true, folios: true, salida: true,
                labelOtorgantes: 'Poderdantes', defFolios: 4, defCS: 1, defCA: 1, defOtorg: 1 },
        T:    { folios: true, salida: true, defFolios: 4, defCS: 1, defCA: 1 },
        A:    { folios: true, salida: true, defFolios: 4, defCS: 1, defCA: 1 },
        V:    { folios: true, salida: true, defFolios: 3, defCS: 1, defCA: 1 },
        N:    { folios: true, salida: true, defFolios: 3, defCS: 1, defCA: 1 },
        F:    { folios: true, salida: true, defFolios: 3, defCS: 0, defCA: 1 },
        // Sucesiones
        TABI: { folios: true, salida: true, copElec: true, defFolios: 4, defCS: 0, defCA: 1 },
        TABM: { folios: true, salida: true, copElec: true, defFolios: 6, defCS: 0, defCA: 1 },
        HERE: { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Valor total de la herencia (€)', defFolios: 15, defCS: 2, defCA: 1 },
        ADHE: { cuantia: true, folios: true, salida: true, copElec: true,
                labelCuantia: 'Valor de la adición (€)', defFolios: 10, defCS: 1, defCA: 1 },
        ACNO: { folios: true, salida: true, copElec: true, defFolios: 8, defCS: 1, defCA: 1 },
        // Legitimaciones
        LEG:  { documentos: true, firmas: true },
        // Testimonios
        TEST: { documentos: true, foliosDoc: true },
        // Actas
        ASCN: { folios: true, salida: true, defFolios: 4, defCS: 1, defCA: 1 },
        ANOT: { folios: true, salida: true, defFolios: 7, defCS: 1, defCA: 1 },
        APRE: { folios: true, salida: true, defFolios: 5, defCS: 1, defCA: 1 }
    };

    // ===== FUNCIONES DE CÁLCULO DE ARANCELES =====
    // (Extraídas de mercantil_macros.js)

    // Conversión pesetas a euros
    function pesetasAEuros(pesetas) {
        return pesetas / PESETA_EURO;
    }

    // Arancel por cuantía (Número 2 del arancel - documentos con cuantía)
    // Escala del RD 1426/1989
    function calcularArancelCuantia(cuantia) {
        if (cuantia <= 6010.12)
            return 90.15;
        if (cuantia <= 30050.61)
            return 90.15 + ((cuantia - 6010.12) * 0.0045);
        if (cuantia <= 60101.21)
            return 90.15 + 108.18 + ((cuantia - 30050.61) * 0.0015);
        if (cuantia <= 150253.03)
            return 90.15 + 108.18 + 45.08 + ((cuantia - 60101.21) * 0.001);
        if (cuantia <= 601012.10)
            return 90.15 + 108.18 + 45.08 + 90.15 + ((cuantia - 150253.03) * 0.0005);
        return 90.15 + 108.18 + 45.08 + 90.15 + 225.38 + ((cuantia - 601012.10) * 0.0003);
    }

    // Arancel por documento sin cuantía (Número 1 del arancel)
    // Acta sin cuantía = 30.05€ (precio base) + 6.01 por folio adicional
    var ACTA_SIN_CUANTIA = 36.06;
    var PRECIO_DOC = 6.010121;
    var PRECIO_FOLIO_MATRIZ = 6.010121;

    // Coste folios de matriz (primeros 4 incluidos en el documento)
    function calcularFoliosMatriz(numFolios) {
        if (numFolios <= 4) return 0;
        return (numFolios - 4) * pesetasAEuros(1000);
    }

    // Coste copias simples
    function calcularCopiasSimples(numCopias, foliosPorCopia) {
        return numCopias * foliosPorCopia * pesetasAEuros(100);
    }

    // Coste copias autorizadas (primeros 11 folios a un precio, resto a otro)
    function calcularCopiasAutorizadas(numCopias, foliosPorCopia) {
        if (foliosPorCopia <= 0) return 0;
        if (foliosPorCopia <= 11) {
            return numCopias * foliosPorCopia * pesetasAEuros(500);
        }
        return numCopias * (11 * pesetasAEuros(500) + (foliosPorCopia - 11) * pesetasAEuros(250));
    }

    // Coste testimonios
    function calcularTestimonios(numTestimonios, foliosPorTestimonio) {
        if (foliosPorTestimonio <= 0) return 0;
        if (foliosPorTestimonio === 1) {
            return pesetasAEuros(500 * numTestimonios);
        }
        return pesetasAEuros((500 + 100 * (foliosPorTestimonio - 1)) * numTestimonios);
    }

    // Coste legitimaciones
    function calcularLegitimaciones(numDocumentos, firmasPorDoc) {
        if (firmasPorDoc <= 0) return 0;
        if (firmasPorDoc === 1) {
            return pesetasAEuros(1000 * numDocumentos);
        }
        return pesetasAEuros((1000 + 500 * (firmasPorDoc - 1)) * numDocumentos);
    }

    // Honorarios de documento sin cuantía (poderes, actas, familia sin cuantía, etc.)
    function calcularHonorariosSinCuantia(foliosMatriz, otorgantes) {
        // Base: 30.05€ (acta/documento) + exceso de folios + otorgantes adicionales
        var base = 30.05;
        // Folios de matriz (exceso sobre los 4 incluidos)
        base += calcularFoliosMatriz(foliosMatriz);
        // Otorgantes: cada otorgante/poderdante adicional = 6.01€
        if (otorgantes && otorgantes > 1) {
            base += (otorgantes - 1) * PRECIO_DOC;
        }
        return base;
    }

    // Honorarios testamento
    function calcularHonorariosTestamento(foliosMatriz, esMancomunado) {
        // Testamento: 30.05€ base
        var base = 30.05;
        base += calcularFoliosMatriz(foliosMatriz);
        if (esMancomunado) {
            base += PRECIO_DOC; // segundo testador
        }
        return base;
    }

    // ===== FORMATO MONEDA =====
    function formatCurrency(value) {
        return value.toLocaleString('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        });
    }

    function redondear(valor) {
        return Math.round(valor * 100) / 100;
    }

    // ===== PARSEAR CUANTÍA (admite formato español: 150.000,50) =====
    function parsearCuantia(texto) {
        if (!texto) return 0;
        // Quitar espacios
        texto = texto.trim();
        // Formato español: puntos como separador miles, coma decimal
        var limpio = texto.replace(/\./g, '').replace(',', '.');
        var valor = parseFloat(limpio);
        return isNaN(valor) ? 0 : valor;
    }

    // ===== ELEMENTOS DOM =====
    var elCategoria = document.getElementById('categoria');
    var elGrupoSubtipo = document.getElementById('grupoSubtipo');
    var elSubtipo = document.getElementById('subtipo');

    var elSeccionDatos = document.getElementById('seccionDatos');
    var elGrupoCuantia = document.getElementById('grupoCuantia');
    var elLabelCuantia = document.getElementById('labelCuantia');
    var elCuantia = document.getElementById('cuantia');
    var elGrupoFolios = document.getElementById('grupoFolios');
    var elFoliosMatriz = document.getElementById('foliosMatriz');
    var elGrupoOtorgantes = document.getElementById('grupoOtorgantes');
    var elLabelOtorgantes = document.getElementById('labelOtorgantes');
    var elOtorgantes = document.getElementById('otorgantes');
    var elGrupoFincas = document.getElementById('grupoFincas');
    var elNumFincas = document.getElementById('numFincas');
    var elGrupoFirmas = document.getElementById('grupoFirmas');
    var elNumFirmas = document.getElementById('numFirmas');
    var elGrupoDocumentos = document.getElementById('grupoDocumentos');
    var elNumDocumentos = document.getElementById('numDocumentos');
    var elGrupoFoliosDoc = document.getElementById('grupoFoliosDoc');
    var elFoliosDocumento = document.getElementById('foliosDocumento');

    var elSeccionCopias = document.getElementById('seccionCopias');
    var elCopiasSimples = document.getElementById('copiasSimples');
    var elFoliosCopiaSimple = document.getElementById('foliosCopiaSimple');
    var elCopiasAutorizadas = document.getElementById('copiasAutorizadas');
    var elFoliosCopiaAutorizada = document.getElementById('foliosCopiaAutorizada');
    var elGrupoCopiasElectronicas = document.getElementById('grupoCopiasElectronicas');
    var elCopiasElectronicas = document.getElementById('copiasElectronicas');

    var elSeccionOpciones = document.getElementById('seccionOpciones');
    var elEsEmpresa = document.getElementById('esEmpresa');
    var elGrupoSalida = document.getElementById('grupoSalida');
    var elSalidaNotario = document.getElementById('salidaNotario');
    var elGrupoHorasSalida = document.getElementById('grupoHorasSalida');
    var elHorasSalida = document.getElementById('horasSalida');
    var elGrupoMensajeria = document.getElementById('grupoMensajeria');
    var elMensajeria = document.getElementById('mensajeria');

    var elSeccionResultado = document.getElementById('seccionResultado');
    var elBtnCalcular = document.getElementById('btnCalcular');
    var elDesglose = document.getElementById('desglose');

    var elSeccionInfo = document.getElementById('seccionInfo');
    var elInfoCalculo = document.getElementById('infoCalculo');

    // ===== TOGGLE BUTTONS =====
    document.querySelectorAll('.toggle-group').forEach(function (group) {
        group.querySelectorAll('.toggle-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = this.dataset.target;
                var value = this.dataset.value;
                // Desactivar hermanos
                group.querySelectorAll('.toggle-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                document.getElementById(target).value = value;

                // Mostrar/ocultar horas de salida
                if (target === 'salidaNotario') {
                    elGrupoHorasSalida.style.display = value === 'si' ? 'block' : 'none';
                }
            });
        });
    });

    // ===== EVENTO: CAMBIO DE CATEGORÍA =====
    elCategoria.addEventListener('change', function () {
        var cat = this.value;
        ocultarTodo();

        if (!cat || !subtipos[cat]) return;

        // Llenar subtipos
        elSubtipo.innerHTML = '<option value="">Selecciona el tipo</option>';
        subtipos[cat].forEach(function (s) {
            var opt = document.createElement('option');
            opt.value = s.value;
            opt.textContent = s.label;
            elSubtipo.appendChild(opt);
        });
        elGrupoSubtipo.style.display = 'block';
    });

    // ===== EVENTO: CAMBIO DE SUBTIPO =====
    elSubtipo.addEventListener('change', function () {
        var tipo = this.value;
        ocultarCampos();

        if (!tipo || !camposPorSubtipo[tipo]) return;

        var conf = camposPorSubtipo[tipo];

        // Mostrar secciones principales
        elSeccionDatos.style.display = 'block';
        elSeccionResultado.style.display = 'block';

        // Cuantía
        if (conf.cuantia) {
            elGrupoCuantia.style.display = 'block';
            elLabelCuantia.textContent = conf.labelCuantia || 'Cuantía de la operación (€)';
            elCuantia.value = '';
        }

        // Folios
        if (conf.folios) {
            elGrupoFolios.style.display = 'block';
            elFoliosMatriz.value = conf.defFolios || 4;
        }

        // Otorgantes
        if (conf.otorgantes) {
            elGrupoOtorgantes.style.display = 'block';
            elLabelOtorgantes.textContent = conf.labelOtorgantes || 'Número de otorgantes';
            elOtorgantes.value = conf.defOtorg || 2;
        }

        // Fincas
        if (conf.fincas) {
            elGrupoFincas.style.display = 'block';
            elNumFincas.value = 1;
        }

        // Firmas (legitimaciones)
        if (conf.firmas) {
            elGrupoFirmas.style.display = 'block';
            elNumFirmas.value = 1;
        }

        // Documentos
        if (conf.documentos) {
            elGrupoDocumentos.style.display = 'block';
            elNumDocumentos.value = 1;
        }

        // Folios por documento (testimonios)
        if (conf.foliosDoc) {
            elGrupoFoliosDoc.style.display = 'block';
            elFoliosDocumento.value = 1;
        }

        // Copias (si hay folios o cuantía, mostrar copias)
        if (conf.folios || conf.cuantia) {
            elSeccionCopias.style.display = 'block';
            var fol = conf.defFolios || 4;
            elCopiasSimples.value = conf.defCS !== undefined ? conf.defCS : 1;
            elFoliosCopiaSimple.value = fol;
            elCopiasAutorizadas.value = conf.defCA !== undefined ? conf.defCA : 1;
            elFoliosCopiaAutorizada.value = fol;
            if (conf.copElec) {
                elGrupoCopiasElectronicas.style.display = 'block';
                elCopiasElectronicas.value = 1;
            }
        }

        // Opciones
        elSeccionOpciones.style.display = 'block';
        if (conf.salida) {
            elGrupoSalida.style.display = 'flex';
        }
        if (conf.mensajeria) {
            elGrupoMensajeria.style.display = 'flex';
        }

        // Ocultar resultado anterior
        elDesglose.style.display = 'none';
        elSeccionInfo.style.display = 'none';
    });

    // ===== EVENTO: CALCULAR =====
    elBtnCalcular.addEventListener('click', function () {
        var tipo = elSubtipo.value;
        if (!tipo || !camposPorSubtipo[tipo]) return;

        var conf = camposPorSubtipo[tipo];
        var cat = elCategoria.value;

        var cuantia = conf.cuantia ? parsearCuantia(elCuantia.value) : 0;
        var folios = conf.folios ? (parseInt(elFoliosMatriz.value) || 4) : 0;
        var otorgantes = conf.otorgantes ? (parseInt(elOtorgantes.value) || 1) : 0;
        var numFincas = conf.fincas ? (parseInt(elNumFincas.value) || 1) : 1;
        var numDocs = conf.documentos ? (parseInt(elNumDocumentos.value) || 1) : 1;
        var numFirmas = conf.firmas ? (parseInt(elNumFirmas.value) || 1) : 0;
        var foliosDoc = conf.foliosDoc ? (parseInt(elFoliosDocumento.value) || 1) : 0;

        var numCS = parseInt(elCopiasSimples.value) || 0;
        var folCS = parseInt(elFoliosCopiaSimple.value) || 0;
        var numCA = parseInt(elCopiasAutorizadas.value) || 0;
        var folCA = parseInt(elFoliosCopiaAutorizada.value) || 0;

        var esEmpresa = elEsEmpresa.value === 'si';
        var salidaNotario = elSalidaNotario.value === 'si';
        var horasSalida = salidaNotario ? (parseInt(elHorasSalida.value) || 1) : 0;
        var conMensajeria = elMensajeria.value === 'si';

        // ===== CÁLCULO =====
        var arancel = 0;
        var costeExcesoFolios = 0;
        var costeCS = 0;
        var costeCA = 0;
        var protocolo = 0;
        var honorarios = 0;
        var suplidos = 0;
        var infoHTML = '';

        // Nombre del subtipo
        var nombreSubtipo = '';
        var subs = subtipos[cat];
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].value === tipo) {
                nombreSubtipo = subs[i].label;
                break;
            }
        }

        // --- Legitimaciones ---
        if (cat === 'legitimaciones') {
            arancel = redondear(calcularLegitimaciones(numDocs, numFirmas));
            honorarios = arancel;
            infoHTML = '<div class="info-header">Legitimación de firmas</div>' +
                '<div class="info-line"><span>Documentos</span><span>' + numDocs + '</span></div>' +
                '<div class="info-line"><span>Firmas por documento</span><span>' + numFirmas + '</span></div>' +
                '<div class="info-line"><span>Fórmula</span><span>(1000 + 500×(firmas−1)) × docs ÷ 166,386</span></div>';
        }
        // --- Testimonios ---
        else if (cat === 'testimonios') {
            arancel = redondear(calcularTestimonios(numDocs, foliosDoc));
            honorarios = arancel;
            infoHTML = '<div class="info-header">Testimonio de documentos</div>' +
                '<div class="info-line"><span>Documentos</span><span>' + numDocs + '</span></div>' +
                '<div class="info-line"><span>Folios por documento</span><span>' + foliosDoc + '</span></div>' +
                '<div class="info-line"><span>Fórmula</span><span>(500 + 100×(folios−1)) × docs ÷ 166,386</span></div>';
        }
        // --- Documentos CON cuantía ---
        else if (conf.cuantia && cuantia > 0) {
            arancel = redondear(calcularArancelCuantia(cuantia));

            // Fincas adicionales (cada finca extra = arancel adicional proporcional)
            if (numFincas > 1) {
                // Según el arancel, por cada finca adicional se aplica un recargo
                arancel = redondear(arancel + (numFincas - 1) * PRECIO_DOC);
            }

            costeExcesoFolios = redondear(calcularFoliosMatriz(folios));
            costeCS = redondear(calcularCopiasSimples(numCS, folCS));
            costeCA = redondear(calcularCopiasAutorizadas(numCA, folCA));
            protocolo = PROTOCOLO_ELECTRONICO;

            honorarios = redondear(arancel + costeExcesoFolios + costeCS + costeCA + protocolo);

            infoHTML = '<div class="info-header">Arancel por cuantía (RD 1426/1989, Nº2)</div>' +
                '<div class="info-line"><span>Hasta 6.010,12€</span><span>90,15€</span></div>' +
                '<div class="info-line"><span>6.010,13 – 30.050,61€</span><span>+0,45%</span></div>' +
                '<div class="info-line"><span>30.050,62 – 60.101,21€</span><span>+0,15%</span></div>' +
                '<div class="info-line"><span>60.101,22 – 150.253,03€</span><span>+0,10%</span></div>' +
                '<div class="info-line"><span>150.253,04 – 601.012,10€</span><span>+0,05%</span></div>' +
                '<div class="info-line"><span>Más de 601.012,10€</span><span>+0,03%</span></div>' +
                '<div class="info-header">Folios de matriz</div>' +
                '<div class="info-line"><span>Primeros 4 folios</span><span>Incluidos</span></div>' +
                '<div class="info-line"><span>Cada folio adicional</span><span>' + formatCurrency(pesetasAEuros(1000)) + '</span></div>';
        }
        // --- Documentos SIN cuantía ---
        else {
            arancel = redondear(calcularHonorariosSinCuantia(folios, otorgantes));

            // Testamentos
            if (tipo === 'TABI') {
                arancel = redondear(calcularHonorariosTestamento(folios, false));
            } else if (tipo === 'TABM') {
                arancel = redondear(calcularHonorariosTestamento(folios, true));
            }
            // Actas
            else if (tipo === 'ASCN' || tipo === 'ANOT' || tipo === 'APRE') {
                arancel = ACTA_SIN_CUANTIA;
                arancel += calcularFoliosMatriz(folios);
                arancel = redondear(arancel);
            }
            // Acta de notoriedad
            else if (tipo === 'ACNO') {
                arancel = ACTA_SIN_CUANTIA;
                arancel += calcularFoliosMatriz(folios);
                arancel = redondear(arancel);
            }
            // Poderes: Junta (PJ) es acta
            else if (tipo === 'PJ') {
                arancel = ACTA_SIN_CUANTIA;
                arancel += calcularFoliosMatriz(folios);
                arancel = redondear(arancel);
            }

            costeExcesoFolios = 0; // Ya incluido en arancel para sin cuantía
            costeCS = redondear(calcularCopiasSimples(numCS, folCS));
            costeCA = redondear(calcularCopiasAutorizadas(numCA, folCA));
            protocolo = PROTOCOLO_ELECTRONICO;

            honorarios = redondear(arancel + costeCS + costeCA + protocolo);

            infoHTML = '<div class="info-header">Documento sin cuantía (RD 1426/1989, Nº1)</div>' +
                '<div class="info-line"><span>Base del documento</span><span>30,05€</span></div>' +
                '<div class="info-line"><span>Cada folio adicional (> 4)</span><span>' + formatCurrency(pesetasAEuros(1000)) + '</span></div>';
            if (otorgantes > 0) {
                infoHTML += '<div class="info-line"><span>Cada otorgante adicional</span><span>' + formatCurrency(PRECIO_DOC) + '</span></div>';
            }
        }

        // Suplidos
        if (salidaNotario) {
            suplidos += SALIDA_NOTARIO_HORA * horasSalida;
        }
        if (conMensajeria) {
            suplidos += MENSAJERIA;
        }
        suplidos = redondear(suplidos);

        // Impuestos
        var ivaImporte = redondear(honorarios * IVA);
        var irpfImporte = esEmpresa ? redondear(honorarios * IRPF) : 0;

        // Total
        var total = redondear(honorarios + ivaImporte - irpfImporte + suplidos);

        // ===== MOSTRAR RESULTADOS =====
        document.getElementById('resultTipoDoc').textContent = nombreSubtipo;

        document.getElementById('resultArancel').textContent = formatCurrency(arancel);

        // Folios matriz
        var lineaFolios = document.getElementById('lineaFoliosMatriz');
        if (costeExcesoFolios > 0) {
            lineaFolios.style.display = 'flex';
            document.getElementById('resultFoliosMatriz').textContent = formatCurrency(costeExcesoFolios);
        } else {
            lineaFolios.style.display = 'none';
        }

        // Copias simples
        var lineaCS = document.getElementById('lineaCopiasSimples');
        if (costeCS > 0) {
            lineaCS.style.display = 'flex';
            document.getElementById('resultCopiasSimples').textContent = formatCurrency(costeCS);
        } else {
            lineaCS.style.display = 'none';
        }

        // Copias autorizadas
        var lineaCA = document.getElementById('lineaCopiasAut');
        if (costeCA > 0) {
            lineaCA.style.display = 'flex';
            document.getElementById('resultCopiasAut').textContent = formatCurrency(costeCA);
        } else {
            lineaCA.style.display = 'none';
        }

        // Protocolo
        var lineaProtocolo = document.getElementById('lineaProtocolo');
        if (protocolo > 0) {
            lineaProtocolo.style.display = 'flex';
            document.getElementById('resultProtocolo').textContent = formatCurrency(protocolo);
        } else {
            lineaProtocolo.style.display = 'none';
        }

        // Total honorarios
        document.getElementById('resultHonorarios').textContent = formatCurrency(honorarios);

        // IVA
        document.getElementById('resultIVA').textContent = formatCurrency(ivaImporte);

        // IRPF
        var lineaIRPF = document.getElementById('lineaIRPF');
        if (irpfImporte > 0) {
            lineaIRPF.style.display = 'flex';
            document.getElementById('resultIRPF').textContent = '−' + formatCurrency(irpfImporte);
        } else {
            lineaIRPF.style.display = 'none';
        }

        // Suplidos
        var tituloSuplidos = document.getElementById('tituloSuplidos');
        var lineaSalida = document.getElementById('lineaSalida');
        var lineaMensajeria = document.getElementById('lineaMensajeria');
        var lineaTotalSuplidos = document.getElementById('lineaTotalSuplidos');

        if (suplidos > 0) {
            tituloSuplidos.style.display = 'block';
            lineaTotalSuplidos.style.display = 'flex';
            document.getElementById('resultSuplidos').textContent = formatCurrency(suplidos);

            if (salidaNotario) {
                lineaSalida.style.display = 'flex';
                document.getElementById('resultSalida').textContent = formatCurrency(SALIDA_NOTARIO_HORA * horasSalida);
            } else {
                lineaSalida.style.display = 'none';
            }

            if (conMensajeria) {
                lineaMensajeria.style.display = 'flex';
                document.getElementById('resultMensajeria').textContent = formatCurrency(MENSAJERIA);
            } else {
                lineaMensajeria.style.display = 'none';
            }
        } else {
            tituloSuplidos.style.display = 'none';
            lineaSalida.style.display = 'none';
            lineaMensajeria.style.display = 'none';
            lineaTotalSuplidos.style.display = 'none';
        }

        // Total
        document.getElementById('resultTotal').textContent = formatCurrency(total);

        // Mostrar desglose
        elDesglose.style.display = 'block';

        // Info
        elInfoCalculo.innerHTML = infoHTML;
        elSeccionInfo.style.display = 'block';
    });

    // ===== FORMATO CUANTÍA EN TIEMPO REAL =====
    elCuantia.addEventListener('blur', function () {
        var valor = parsearCuantia(this.value);
        if (valor > 0) {
            this.value = valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    });

    // ===== FUNCIONES AUXILIARES =====
    function ocultarTodo() {
        elGrupoSubtipo.style.display = 'none';
        elSubtipo.value = '';
        ocultarCampos();
    }

    function ocultarCampos() {
        elSeccionDatos.style.display = 'none';
        elGrupoCuantia.style.display = 'none';
        elGrupoFolios.style.display = 'none';
        elGrupoOtorgantes.style.display = 'none';
        elGrupoFincas.style.display = 'none';
        elGrupoFirmas.style.display = 'none';
        elGrupoDocumentos.style.display = 'none';
        elGrupoFoliosDoc.style.display = 'none';

        elSeccionCopias.style.display = 'none';
        elGrupoCopiasElectronicas.style.display = 'none';

        elSeccionOpciones.style.display = 'none';
        elGrupoSalida.style.display = 'none';
        elGrupoHorasSalida.style.display = 'none';
        elGrupoMensajeria.style.display = 'none';

        elSeccionResultado.style.display = 'none';
        elDesglose.style.display = 'none';
        elSeccionInfo.style.display = 'none';

        // Reset toggles
        resetToggle('esEmpresa');
        resetToggle('salidaNotario');
        resetToggle('mensajeria');
    }

    function resetToggle(id) {
        document.getElementById(id).value = 'no';
        var input = document.getElementById(id);
        var row = input.closest('.toggle-row');
        if (row) {
            row.querySelectorAll('.toggle-btn').forEach(function (btn) {
                btn.classList.remove('active');
                if (btn.dataset.value === 'no') btn.classList.add('active');
            });
        }
    }

})();
