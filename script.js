document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN E INICIALIZACIÓN GLOBAL ---
    const firebaseConfig = {
        apiKey: "AIzaSyD_SCyO4s-fZZS2qBTKEqAFiWP3IPD97Uo",
        authDomain: "plataforma-escala.firebaseapp.com",
        projectId: "plataforma-escala",
        storageBucket: "plataforma-escala.firebasestorage.app",
        messagingSenderId: "917193676993",
        appId: "1:917193676993:web:da3a51e59246bd917c1c40"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    setupHighlighter();
    let currentUser = null;

    // --- 2. BASE DE DATOS LOCAL DE EXÁMENES Y PREGUNTAS (Global) ---
    const examenes = [
        { id: 1, proceso: 'Nombramiento', anio: 2024, nivel: 'Primaria', especialidad: 'General', modalidad: 'EBR', preguntas: 2, tiempo: 10 },
        { id: 2, proceso: 'Nombramiento', anio: 2024, nivel: 'Secundaria', especialidad: 'Matemática', modalidad: 'EBR', preguntas: 3, tiempo: 15 },
        { id: 3, proceso: 'Ascenso', anio: 2023, nivel: 'Primaria', especialidad: 'General', modalidad: 'EBR', preguntas: 60, tiempo: 180 },
        { id: 4, proceso: 'Ascenso', anio: 2023, nivel: 'Secundaria', especialidad: 'Comunicación', modalidad: 'EBR', preguntas: 60, tiempo: 180 },
        { id: 5, proceso: 'Nombramiento', anio: 2022, nivel: 'Inicial', especialidad: 'General', modalidad: 'EBR', preguntas: 90, tiempo: 270 },
        { id: 6, proceso: 'Nombramiento', anio: 2018, nivel: 'Secundaria', especialidad: 'Matemática', modalidad: 'EBR', preguntas: 90, tiempo: 180, questionKey: 'nombramientoSecundariaMatematica2018' },
        { id: 7, proceso: 'Nombramiento', anio: 2018, nivel: 'Secundaria', especialidad: 'Comunicación', modalidad: 'EBR', preguntas: 90, tiempo: 180, questionKey: 'nombramientoSecundariaComunicacion2018' },
        { id: 8, proceso: 'Nombramiento', anio: 2018, nivel: 'Primaria', especialidad: 'General', modalidad: 'EBR', preguntas: 90, tiempo: 270, questionKey: 'nombramientoPrimariaGeneral2018' },
        { id: 9, proceso: 'Nombramiento', anio: 2018, nivel: 'Secundaria', especialidad: 'Educación Física', modalidad: 'EBR', preguntas: 90, tiempo: 180, questionKey: 'nombramientoSecundariaEdFisica2018' },
        { id: 10, proceso: 'Nombramiento', anio: 2018, nivel: 'Secundaria', especialidad: 'Ciencia y Tecnología', modalidad: 'EBR', preguntas: 90, tiempo: 180, questionKey: 'nombramientoSecundariaCienciaTec2018' }
    ];

    const bancoDePreguntas = {
        'nombramientoSecundariaMatematica2018': {
            'completo': [
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
                ...(typeof dataMatematica2018 !== 'undefined' ? dataMatematica2018.conocimientosPedagogicos : [])
            ],
            'Comprensión Lectora': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
            'Razonamiento Lógico': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
            'Conocimientos Pedagógicos': (typeof dataMatematica2018 !== 'undefined' ? dataMatematica2018.conocimientosPedagogicos : [])
        },
        'nombramientoSecundariaComunicacion2018': {
            'completo': [
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
                ...(typeof dataComunicacion2018 !== 'undefined' ? dataComunicacion2018.conocimientosPedagogicos : [])
            ],
            'Comprensión Lectora': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
            'Razonamiento Lógico': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
            'Conocimientos Pedagógicos': (typeof dataComunicacion2018 !== 'undefined' ? dataComunicacion2018.conocimientosPedagogicos : [])
        },
        'nombramientoPrimariaGeneral2018': {
            'completo': [
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
                ...(typeof dataPrimaria2018 !== 'undefined' ? dataPrimaria2018.conocimientosPedagogicos : [])
            ],
            'Comprensión Lectora': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
            'Razonamiento Lógico': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
            'Conocimientos Pedagógicos': (typeof dataPrimaria2018 !== 'undefined' ? dataPrimaria2018.conocimientosPedagogicos : [])
        },
        'nombramientoSecundariaEdFisica2018': {
            'completo': [
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
                ...(typeof dataEducacionFisica2018 !== 'undefined' ? dataEducacionFisica2018.conocimientosPedagogicos : [])
            ],
            'Comprensión Lectora': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
            'Razonamiento Lógico': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
            'Conocimientos Pedagógicos': (typeof dataEducacionFisica2018 !== 'undefined' ? dataEducacionFisica2018.conocimientosPedagogicos : [])
        },
        'nombramientoSecundariaCienciaTec2018': {
            'completo': [
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
                ...(typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
                ...(typeof dataCienciaTecnologia2018 !== 'undefined' ? dataCienciaTecnologia2018.conocimientosPedagogicos : [])
            ],
            'Comprensión Lectora': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.comprensionLectora : []),
            'Razonamiento Lógico': (typeof dataGenericaEBR2018 !== 'undefined' ? dataGenericaEBR2018.razonamientoLogico : []),
            'Conocimientos Pedagógicos': (typeof dataCienciaTecnologia2018 !== 'undefined' ? dataCienciaTecnologia2018.conocimientosPedagogicos : [])
        }
    };
    // 👇 REEMPLAZA tu función guardarParaRepaso con esta 👇
    const guardarParaRepaso = (examenId, seccion, indicePregunta) => {
        const mazoRepaso = JSON.parse(localStorage.getItem('mazoRepaso')) || [];
        const idUnicoPregunta = `${examenId}-${seccion}-${indicePregunta}`;

        if (mazoRepaso.some(p => p.idUnico === idUnicoPregunta)) {
            showToast('Esta pregunta ya está en tu mazo.'); // <-- CAMBIO AQUÍ
            return;
        }

        mazoRepaso.push({
            idUnico: idUnicoPregunta,
            examenId: examenId,
            seccion: seccion,
            indice: indicePregunta,
            fechaGuardado: new Date().toISOString()
        });

        localStorage.setItem('mazoRepaso', JSON.stringify(mazoRepaso));
        showToast('¡Pregunta guardada en tu mazo!'); // <-- CAMBIO AQUÍ
    };
    // ... justo después de la función guardarParaRepaso ...

    const showToast = (message) => {
        // Creamos el elemento del toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerText = message;
        document.body.appendChild(toast);

        // Hacemos que aparezca
        setTimeout(() => {
            toast.classList.add('show');
        }, 100); // Pequeño delay para que la transición funcione

        // Hacemos que desaparezca después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            // Eliminamos el elemento del DOM después de la transición
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    };

    const showConfirm = (title, message) => {
        return new Promise((resolve, reject) => {
            const confirmModalOverlay = document.createElement('div');
            confirmModalOverlay.className = 'modal-overlay active';

            confirmModalOverlay.innerHTML = `
            <div class="modal-container confirm-modal-container">
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button class="btn-secondary" id="confirm-cancel-btn">Cancelar</button>
                    <button class="btn-cta" id="confirm-accept-btn">Aceptar</button>
                </div>
            </div>
        `;
            document.body.appendChild(confirmModalOverlay);

            const acceptBtn = document.getElementById('confirm-accept-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            acceptBtn.addEventListener('click', () => {
                document.body.removeChild(confirmModalOverlay);
                resolve(); // El usuario aceptó
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(confirmModalOverlay);
                reject(); // El usuario canceló
            });
        });
    };



    function setupHighlighter() {
        const highlighterTooltip = document.getElementById('highlighter-tooltip');
        const highlightBtn = document.getElementById('highlight-btn');
        let savedRange; // Variable para guardar la selección del usuario

        if (!highlighterTooltip || !highlightBtn) {
            // Si no existen los elementos del marcador en el HTML, no hacemos nada.
            return;
        }

        // VIGILANTE PRINCIPAL: Se activa cuando el usuario suelta el mouse en cualquier parte del documento
        document.addEventListener('mouseup', (e) => {
            // 1. Ocultamos el botón por defecto, a menos que se haya hecho clic sobre él.
            if (!e.target.closest('#highlighter-tooltip')) {
                highlighterTooltip.style.display = 'none';
            }

            // 2. Definimos las áreas donde sí se puede resaltar texto.
            const isHighlightable = e.target.closest('#context-container-practica, #question-text-practica, .exam-content');

            // Si el clic fue fuera de un área permitida, no hacemos nada más.
            if (!isHighlightable) return;

            // Usamos un pequeño delay para que el navegador procese la selección
            setTimeout(() => {
                const selection = window.getSelection();

                // 3. Si hay texto seleccionado, mostramos y posicionamos el botón
                if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    savedRange = range.cloneRange(); // Guardamos la selección para usarla después
                    const rect = range.getBoundingClientRect();

                    // Calculamos la posición del botón encima del texto
                    highlighterTooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (highlighterTooltip.offsetWidth / 2)}px`;
                    highlighterTooltip.style.top = `${rect.top + window.scrollY - highlighterTooltip.offsetHeight - 10}px`;
                    highlighterTooltip.style.display = 'block';
                }
            }, 10);
        });

        // ACCIÓN DEL BOTÓN: Se activa cuando el usuario hace clic en "Marcar"
        highlightBtn.addEventListener('click', () => {
            if (savedRange) {
                const span = document.createElement('span');
                span.className = 'highlighted';
                try {
                    savedRange.surroundContents(span); // Intentamos envolver el texto con nuestro <span>
                } catch (error) {
                    console.error("Error al resaltar, usando método alternativo:", error);
                    // Si el método moderno falla (ej: selección compleja), usamos un fallback.
                    document.execCommand('hiliteColor', false, 'rgba(255, 255, 0, 0.4)');
                }

                window.getSelection().removeAllRanges(); // Limpiamos la selección visual
                highlighterTooltip.style.display = 'none'; // Ocultamos el botón
            }
        });
    }
    // ========================================================================
    // INICIA LÓGICA PARA LA GUÍA VISUAL DEL MARCADOR (VERSIÓN MEJORADA)
    // ========================================================================
    // 👇 REEMPLAZA TU FUNCIÓN DE LA GUÍA CON ESTA VERSIÓN SIMPLIFICADA 👇

    function mostrarGuiaHighlighterSiEsNecesario() {
        const overlay = document.getElementById('highlighter-guide-overlay');
        if (!overlay) return;

        // Directamente mostramos la guía
        overlay.style.display = 'flex';

        const closeBtn = document.getElementById('close-guide-btn');
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            // Ya no guardamos nada en localStorage, por eso se mostrará siempre.
        });
    }
    // ========================================================================
    // FIN DE LA LÓGICA DE LA GUÍA
    // ========================================================================



    // --- 3. FUNCIONES Y OBSERVADORES GLOBALES ---
    const logout = () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => console.error("Error al cerrar sesión:", error));
    };

    // 👇 REEMPLAZA TU FUNCIÓN setupUI COMPLETA CON ESTA VERSIÓN MEJORADA 👇
    const setupUI = (user) => {
        const mainNav = document.querySelector('.main-nav');
        if (!mainNav) return; // Si no hay barra de navegación, no hacemos nada

        // --- 1. LIMPIAR ESTADO ANTERIOR ---
        // Buscamos y eliminamos cualquier botón de login o perfil de usuario existente para evitar duplicados.
        const oldLoginBtn = document.getElementById('login-btn');
        const oldUserProfile = mainNav.querySelector('.user-profile');
        if (oldLoginBtn) oldLoginBtn.remove();
        if (oldUserProfile) oldUserProfile.remove();

        // --- 2. LÓGICA DE BOTONES GLOBALES (en la barra de navegación) ---
        if (user) {
            // Si el usuario SÍ ha iniciado sesión, CREAMOS el perfil de usuario
            const userProfile = document.createElement('div');
            userProfile.classList.add('user-profile');
            userProfile.innerHTML = `
            <img src="${user.photoURL || 'default-avatar.png'}" alt="${user.displayName}" class="profile-pic">
            <span class="profile-name">${user.displayName.split(' ')[0]}</span>
            <button class="btn-logout" id="logout-btn">Cerrar Sesión</button>
        `;
            mainNav.appendChild(userProfile);

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', logout);

        } else {
            // Si el usuario NO ha iniciado sesión, CREAMOS el botón de "Iniciar Sesión"
            const loginBtn = document.createElement('button');
            loginBtn.id = 'login-btn';
            loginBtn.className = 'btn-login';
            loginBtn.innerText = 'Iniciar Sesión';
            mainNav.appendChild(loginBtn);

            // CÓDIGO CORREGIDO
            loginBtn.addEventListener('click', () => openModal());
        }

        // --- 3. LÓGICA DE BOTONES ESPECÍFICOS (en el cuerpo de la página de inicio) ---
        const ctaBtn = document.getElementById('cta-btn');
        if (ctaBtn) { // Solo si estamos en una página que tiene este botón
            if (user) {
                ctaBtn.innerText = "Ir a mis exámenes";
                ctaBtn.onclick = () => { window.location.href = 'examenes.html'; };
            } else {
                ctaBtn.innerText = "Empieza a Practicar Gratis";
                ctaBtn.onclick = () => openModal();
            }
        }

        // --- 4. INTERCEPTOR INTELIGENTE DEL ENLACE DE EXÁMENES ---

    };

    // --- FUNCIÓN PARA ABRIR EL MODAL (Asegúrate de que esté disponible) ---
    // Es posible que esta función esté dentro de otra sección, vamos a asegurarnos de que sea global.
    const openModal = (message) => {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalMessage = document.getElementById('modal-message');
        const defaultModalText = "Elige una opción para acceder a todos los simulacros y seguir tu progreso.";

        if (modalOverlay) {
            if (modalMessage) modalMessage.innerText = message || defaultModalText;
            modalOverlay.classList.add('active');
        }
    };
    auth.onAuthStateChanged(user => {
        currentUser = user;
        setupUI(user);
    });


    // Lógica para la PÁGINA PRINCIPAL (index.html) con DIAGNÓSTICO
    if (document.getElementById('hero-section')) {
        console.log("✔️ Lógica de la página de inicio CARGADA.");

        const modalOverlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('close-btn');
        const googleLoginBtn = document.getElementById('google-login');
        const facebookLoginBtn = document.getElementById('facebook-login');

        const closeModal = () => modalOverlay.classList.remove('active');

        // Asignamos listeners a los botones internos del modal
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) closeModal();
            });
        }

        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                console.log("🖱️ Clic en 'Continuar con Google' detectado.");
                try {
                    console.log("🚀 Intentando llamar a Firebase...");
                    auth.signInWithPopup(googleProvider)
                        .then((result) => {
                            console.log("✅ ÉXITO: Usuario autenticado:", result.user.displayName);
                            closeModal();
                        })
                        .catch((error) => {
                            console.error("❌ ERROR de Firebase al intentar abrir el pop-up:", error);
                            alert("ERROR: No se pudo iniciar sesión. Revisa la consola (F12) para ver los detalles. Puede ser un pop-up bloqueado o un problema de configuración de Firebase.");
                        });
                } catch (e) {
                    console.error("❌ ERROR CATASTRÓFICO: El objeto 'auth' de Firebase no funciona.", e);
                    alert("Error grave en el script. Revisa la consola (F12).");
                }
            });
        }

        if (facebookLoginBtn) {
            facebookLoginBtn.addEventListener('click', () => {
                console.log("🖱️ Clic en 'Continuar con Facebook' detectado.");
                closeModal();
                auth.signInWithPopup(facebookProvider).catch(err => console.error(err));
            });
        }
    }

    // Lógica para la PÁGINA DE EXÁMENES (examenes.html)
    if (document.getElementById('filters-container')) {

        // --- GUARDIÁN DE AUTENTICACIÓN (ESTA ES LA CORRECCIÓN) ---
        // Este código se ejecuta primero para proteger la ruta.
        auth.onAuthStateChanged(user => {
            if (user) {
                // 1. Si el usuario SÍ ha iniciado sesión, ejecutamos toda la lógica para construir la página.
                console.log("Acceso concedido a la biblioteca de exámenes.");
                inicializarPaginaExamenes();
            } else {
                // 2. Si el usuario NO ha iniciado sesión, lo redirigimos inmediatamente.
                console.log("Acceso denegado. Usuario no autenticado. Redirigiendo...");
                window.location.href = 'index.html';
            }
        });

        // --- FUNCIÓN DE INICIALIZACIÓN ---
        // He movido todo tu código original a esta función para que solo se ejecute si el guardián da permiso.
        const inicializarPaginaExamenes = () => {
            const filtersContainer = document.getElementById('filters-container');
            const examsListContainer = document.getElementById('exams-list');
            const sectionModal = document.getElementById('section-modal-overlay');
            const sectionModalTitle = document.getElementById('section-modal-title');
            const sectionButtons = document.querySelector('.section-buttons');
            const sectionCloseBtn = document.getElementById('section-close-btn');

            const aplicarFiltros = () => {
                const proceso = document.getElementById('filtro-proceso').value;
                const anio = document.getElementById('filtro-anio').value;
                const nivel = document.getElementById('filtro-nivel').value;
                const especialidad = document.getElementById('filtro-especialidad').value;

                const examenesFiltrados = examenes.filter(examen =>
                    (proceso === 'todos' || examen.proceso === proceso) &&
                    (anio === 'todos' || examen.anio == anio) &&
                    (nivel === 'todos' || examen.nivel === nivel) &&
                    (especialidad === 'todos' || examen.especialidad === especialidad)
                );
                mostrarExamenes(examenesFiltrados);
                examsListContainer.scrollIntoView({ behavior: 'smooth' });
            };

            const openSectionModal = (examId, mode) => {
                sectionModalTitle.innerText = `Modo ${mode}`;
                sectionButtons.dataset.examId = examId;
                sectionButtons.dataset.mode = mode;
                sectionModal.classList.add('active');
            };

            const mostrarExamenes = (examenesFiltrados) => {
                examsListContainer.innerHTML = '';
                if (examenesFiltrados.length === 0) {
                    examsListContainer.innerHTML = '<p class="no-results">No se encontraron exámenes con los filtros seleccionados.</p>';
                    return;
                }

                examenesFiltrados.forEach(examen => {
                    const examenCard = document.createElement('div');
                    examenCard.classList.add('examen-card');
                    examenCard.innerHTML = `
                <div class="examen-info"><h3>${examen.proceso} ${examen.anio} - ${examen.modalidad}</h3><p>${examen.nivel} - ${examen.especialidad}</p></div>
                <div class="examen-details"><span>${examen.preguntas} preguntas</span><span>${examen.tiempo} min</span></div>
                <div class="examen-actions">
                    <button class="btn-practica" data-id="${examen.id}">Modo Práctica</button>
                    <button class="btn-simulacro" data-id="${examen.id}">Modo Simulacro</button>
                </div>
            `;
                    examsListContainer.appendChild(examenCard);
                });

                document.querySelectorAll('.btn-simulacro').forEach(button => {
                    button.addEventListener('click', (e) => openSectionModal(e.target.dataset.id, 'simulacro'));
                });
                document.querySelectorAll('.btn-practica').forEach(button => {
                    button.addEventListener('click', (e) => openSectionModal(e.target.dataset.id, 'practica'));
                });
            };

            const crearFiltros = () => {
                const procesos = [...new Set(examenes.map(e => e.proceso))];
                const anios = [...new Set(examenes.map(e => e.anio))].sort((a, b) => b - a);
                const niveles = [...new Set(examenes.map(e => e.nivel))];
                const especialidades = [...new Set(examenes.map(e => e.especialidad))];

                filtersContainer.innerHTML = `
            <select id="filtro-proceso"><option value="todos">Selecciona un Proceso</option>${procesos.map(p => `<option value="${p}">${p}</option>`).join('')}</select>
            <select id="filtro-anio"><option value="todos">Selecciona un Año</option>${anios.map(a => `<option value="${a}">${a}</option>`).join('')}</select>
            <select id="filtro-nivel"><option value="todos">Selecciona un Nivel</option>${niveles.map(n => `<option value="${n}">${n}</option>`).join('')}</select>
            <select id="filtro-especialidad"><option value="todos">Selecciona un Área</option>${especialidades.map(es => `<option value="${es}">${es}</option>`).join('')}</select>
            <button id="btn-buscar" class="btn-buscar">Buscar</button>
            `;
            };

            crearFiltros();
            examsListContainer.innerHTML = '<p class="no-results">Usa los filtros y presiona "Buscar" para ver los exámenes disponibles.</p>';
            const filtroNivel = document.getElementById('filtro-nivel');
            const filtroEspecialidad = document.getElementById('filtro-especialidad');

            if (filtroNivel && filtroEspecialidad) {
                const actualizarFiltrosDependientes = () => {
                    const nivelSeleccionado = filtroNivel.value;
                    const todasLasEspecialidades = [...new Set(examenes.map(e => e.especialidad))];
                    let opcionesHTML = '<option value="todos">Selecciona un Área</option>';

                    if (nivelSeleccionado === 'Secundaria') {
                        const especialidadesSecundaria = todasLasEspecialidades.filter(e => e !== 'General');
                        opcionesHTML += especialidadesSecundaria.map(es => `<option value="${es}">${es}</option>`).join('');
                        filtroEspecialidad.innerHTML = opcionesHTML;
                        filtroEspecialidad.disabled = false;
                    } else if (nivelSeleccionado === 'Primaria' || nivelSeleccionado === 'Inicial') {
                        opcionesHTML += '<option value="General">General</option>';
                        filtroEspecialidad.innerHTML = opcionesHTML;
                        filtroEspecialidad.value = 'General';
                        filtroEspecialidad.disabled = true;
                    } else {
                        opcionesHTML += todasLasEspecialidades.map(es => `<option value="${es}">${es}</option>`).join('');
                        filtroEspecialidad.innerHTML = opcionesHTML;
                        filtroEspecialidad.disabled = false;
                    }
                };
                filtroNivel.addEventListener('change', actualizarFiltrosDependientes);
                window.addEventListener('pageshow', () => {
                    actualizarFiltrosDependientes();
                });
            }

            document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);
            filtersContainer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') aplicarFiltros();
            });

            sectionCloseBtn.addEventListener('click', () => sectionModal.classList.remove('active'));
            document.querySelectorAll('.btn-section').forEach(button => {
                button.addEventListener('click', (e) => {
                    const examId = sectionButtons.dataset.examId;
                    const mode = sectionButtons.dataset.mode;
                    const section = e.target.dataset.section;
                    window.location.href = `${mode}.html?id=${examId}&seccion=${section}`;
                });
            });
            document.getElementById('loader').style.display = 'none';
            document.getElementById('main-content').classList.remove('content-hidden');
        };
    }
    mostrarGuiaHighlighterSiEsNecesario('practica');

    // REEMPLAZA ESTA SECCIÓN EN TU SCRIPT.JS

    if (window.location.pathname.endsWith('simulacro.html')) {
        mostrarGuiaHighlighterSiEsNecesario('simulacro');
        // --- VARIABLES DE ESTADO ---
        let userAnswers = {};
        let examQuestions = [];
        let flaggedQuestions = new Set();
        let timeRemaining;
        let timerInterval;
        let isPaused = false;

        // --- ELEMENTOS DEL DOM ---
        const examTitle = document.getElementById('exam-title');
        const timerEl = document.getElementById('timer');
        const questionsContainer = document.getElementById('questions-container');
        const finishBtn = document.getElementById('finish-btn');
        const navigatorContainer = document.getElementById('question-navigator');
        const pauseBtn = document.getElementById('pause-btn');
        const pauseOverlay = document.getElementById('pause-overlay');
        const confirmOverlay = document.getElementById('confirm-finish-overlay');
        const confirmYesBtn = document.getElementById('confirm-yes-btn');
        const confirmNoBtn = document.getElementById('confirm-no-btn');
        const navigationContainer = document.querySelector('.navigation-buttons');

        // --- FUNCIONES DEL TEMPORIZADOR ---
        const updateTimerDisplay = () => {
            if (!timerEl) return;
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = timeRemaining % 60;
            timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const startTimer = () => {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (!isPaused && timeRemaining > 0) {
                    timeRemaining--;
                    updateTimerDisplay();
                } else if (timeRemaining <= 0) {
                    finalizarExamen();
                }
            }, 1000);
        };

        const togglePause = () => {
            isPaused = !isPaused;
            if (isPaused) {
                pauseBtn.innerText = 'Continuar';
                pauseOverlay.classList.add('active');
            } else {
                pauseBtn.innerText = 'Pausar';
                pauseOverlay.classList.remove('active');
            }
        };

        // --- FUNCIONES DE RENDERIZADO Y LÓGICA DEL EXAMEN ---
        const crearNavegador = (totalPreguntas) => {
            if (!navigatorContainer) return;
            navigatorContainer.innerHTML = '';
            for (let i = 0; i < totalPreguntas; i++) {
                const navButton = document.createElement('button');
                navButton.classList.add('nav-question-btn');
                navButton.innerText = i + 1;
                navButton.dataset.index = i;
                navButton.addEventListener('click', () => {
                    const questionElement = document.getElementById(`question-wrapper-${i}`);
                    if (questionElement) {
                        questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
                navigatorContainer.appendChild(navButton);
            }
        };

        const mostrarExamenCompleto = (bloques) => {
            questionsContainer.innerHTML = '';
            // Activamos el marcador para todo el contenedor de preguntas

            let questionCounter = 0;
            const todasLasPreguntas = bloques.flatMap(b => b.preguntas);

            crearNavegador(todasLasPreguntas.length);

            bloques.forEach(bloque => {
                if (bloque.contexto) {
                    const contextoDiv = document.createElement('div');
                    contextoDiv.classList.add('contexto-examen');
                    contextoDiv.innerHTML = `<p>${bloque.contexto.replace(/\n/g, '<br>')}</p>`;
                    questionsContainer.appendChild(contextoDiv);
                }
                if (bloque.imagen) {
                    const imagenEl = document.createElement('img');
                    imagenEl.classList.add('imagen-examen');
                    imagenEl.src = bloque.imagen;
                    imagenEl.alt = "Imagen de la pregunta";
                    questionsContainer.appendChild(imagenEl);
                }

                bloque.preguntas.forEach(pregunta => {
                    const questionIndex = questionCounter;
                    const questionWrapper = document.createElement('div');
                    questionWrapper.id = `question-wrapper-${questionIndex}`;
                    questionWrapper.classList.add('question-wrapper');

                    let optionsHTML = '';
                    pregunta.opciones.forEach(opcion => {
                        optionsHTML += `<div class="option" data-question-index="${questionIndex}">${opcion}</div>`;
                    });

                    questionWrapper.innerHTML = `
                    <div class="question-header">
                        <h3>Pregunta ${questionIndex + 1}</h3>
                        <button class="flag-btn" data-index="${questionIndex}" title="Marcar para revisar más tarde">🚩</button>
                    </div>
                    <p>${pregunta.pregunta}</p>
                    <div class="options-container">${optionsHTML}</div>
                `;
                    questionsContainer.appendChild(questionWrapper);

                    const flagBtn = questionWrapper.querySelector('.flag-btn');
                    flagBtn.addEventListener('click', () => {
                        const idx = parseInt(flagBtn.dataset.index);
                        const navButton = document.querySelector(`.nav-question-btn[data-index="${idx}"]`);
                        if (flaggedQuestions.has(idx)) {
                            flaggedQuestions.delete(idx);
                            flagBtn.classList.remove('flagged');
                            if (navButton) navButton.classList.remove('flagged');
                        } else {
                            flaggedQuestions.add(idx);
                            flagBtn.classList.add('flagged');
                            if (navButton) navButton.classList.add('flagged');
                        }
                    });

                    const currentOptions = questionWrapper.querySelectorAll('.option');
                    currentOptions.forEach(opt => {
                        opt.addEventListener('click', (e) => {
                            // CÓDIGO CORREGIDO:
                            const idx = parseInt(e.target.dataset.questionIndex);
                            userAnswers[idx] = e.target.innerText;
                            const parentOptions = e.target.parentElement.querySelectorAll('.option');
                            parentOptions.forEach(o => o.classList.remove('selected'));
                            e.target.classList.add('selected');
                            const navButton = document.querySelector(`.nav-question-btn[data-index="${idx}"]`);
                            if (navButton) navButton.classList.add('answered');
                        });
                    });
                    questionCounter++;
                });
            });
        };

        // 👇 PEGA ESTE CÓDIGO COMPLETO EN LUGAR DE TU FUNCIÓN finalizarExamen EXISTENTE 👇

        // 👇 REEMPLAZA TU FUNCIÓN finalizarExamen CON ESTA VERSIÓN FINAL 👇

        const finalizarExamen = () => {
            document.body.classList.add('results-view');
            clearInterval(timerInterval);
            let correctas = 0, incorrectas = 0, enBlanco = 0;
            const todasLasPreguntas = examQuestions.flatMap(bloque => bloque.preguntas);
            todasLasPreguntas.forEach((pregunta, index) => {
                const respuestaUsuario = userAnswers[index];
                if (!respuestaUsuario) enBlanco++;
                else if (respuestaUsuario === pregunta.respuesta) correctas++;
                else incorrectas++;
            });

            const totalPreguntas = todasLasPreguntas.length;
            const puntaje = totalPreguntas > 0 ? (correctas / totalPreguntas) * 100 : 0;
            const params = new URLSearchParams(window.location.search);
            const resultados = {
                titulo: examTitle.innerText,
                examenOriginal: {
                    id: params.get('id'),
                    seccion: params.get('seccion')
                },
                totalPreguntas, correctas, incorrectas, enBlanco,
                puntaje: puntaje.toFixed(2),
                bloques: examQuestions,
                respuestasUsuario: userAnswers,
                fecha: new Date().toISOString()
            };

            localStorage.setItem('resultadosExamen', JSON.stringify(resultados));

            if (currentUser && db) {
                db.collection('usuarios').doc(currentUser.uid).collection('historialExamenes').add(resultados)
                    .then(() => {
                        console.log("¡Historial del examen completo guardado en Firestore con éxito!");
                    })
                    .catch(error => {
                        console.error("Error al guardar el historial en Firestore:", error);
                    });
            }

            // --- INICIO DE LA CORRECCIÓN ---
            // Ocultamos todos los controles del examen, incluyendo el botón de finalizar
            if (timerEl) timerEl.style.display = 'none';
            if (navigationContainer) navigationContainer.style.display = 'none';
            if (navigatorContainer) navigatorContainer.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (finishBtn) finishBtn.style.display = 'none'; // <-- ESTA ES LA LÍNEA NUEVA QUE AÑADIMOS
            // --- FIN DE LA CORRECCIÓN ---

            examTitle.innerText = 'Resultados del Examen';
            questionsContainer.innerHTML = `
    <div class="summary-card">
        <div class="summary-exam-title">${resultados.titulo}</div>
        <div class="summary-cards-grid">
            <div class="summary-card-item score">
                <span>Puntaje</span>
                <p>${resultados.puntaje}%</p>
            </div>
            <div class="summary-card-item correct">
                <span>Correctas</span>
                <p>${resultados.correctas}</p>
            </div>
            <div class="summary-card-item incorrect">
                <span>Incorrectas</span>
                <p>${resultados.incorrectas}</p>
            </div>
            <div class="summary-card-item blank">
                <span>En Blanco</span>
                <p>${resultados.enBlanco}</p>
            </div>
        </div>
        <div class="results-actions">
            <button id="review-exam-btn" class="btn-cta">Revisar Detalle</button>
            <button id="back-to-library-btn" class="btn-secondary">Volver a la Biblioteca</button>
        </div>
    </div>
`;

            document.getElementById('review-exam-btn').addEventListener('click', () => { window.location.href = 'resultados.html'; });
            document.getElementById('back-to-library-btn').addEventListener('click', () => { window.location.href = 'examenes.html'; });
        };

        // --- LÓGICA PRINCIPAL DE LA PÁGINA ---
        const params = new URLSearchParams(window.location.search);
        const examId = params.get('id');
        const seccion = params.get('seccion');
        const examData = examenes.find(e => e.id == examId);

        if (examData && seccion) {
            examTitle.innerText = `${examData.proceso} ${examData.anio} - ${examData.especialidad} | ${seccion.replace(/_/g, ' ').toUpperCase()}`;
            const questionKey = examData.questionKey;
            const examQuestionSets = bancoDePreguntas[questionKey] || {};

            examQuestions = (seccion === 'completo')
                ? examQuestionSets['completo']
                : examQuestionSets[seccion] || [];

            const totalPreguntasSeccion = examQuestions.reduce((total, bloque) => total + (bloque.preguntas ? bloque.preguntas.length : 0), 0);

            if (totalPreguntasSeccion > 0) {
                const totalPreguntasExamenCompleto = examData.preguntas;
                const tiempoTotalExamenCompleto = 225 * 60;

                if (seccion === 'completo') {
                    timeRemaining = tiempoTotalExamenCompleto;
                } else {
                    timeRemaining = Math.round((totalPreguntasSeccion / totalPreguntasExamenCompleto) * tiempoTotalExamenCompleto);
                }

                mostrarExamenCompleto(examQuestions);
                updateTimerDisplay();
                startTimer();
                if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
                if (pauseOverlay) pauseOverlay.addEventListener('click', togglePause);

            } else {
                questionsContainer.innerHTML = "<p>Error: No se encontraron preguntas para esta sección del examen.</p>";
                if (timerEl) timerEl.style.display = 'none';
                if (pauseBtn) pauseBtn.style.display = 'none';
            }
        } else {
            examTitle.innerText = "Error al cargar el examen";
            questionsContainer.innerHTML = "<p>No se especificó un examen o una sección válida.</p>";
        }

        // REEMPLAZA el listener del botón de finalizar con esto:
        if (finishBtn) {
            // Al hacer clic, solo abrimos la ventana de confirmación
            finishBtn.addEventListener('click', () => {
                if (confirmOverlay) confirmOverlay.classList.add('active');
            });
        }

        // Le damos vida a los botones de la nueva ventana
        if (confirmYesBtn) {
            confirmYesBtn.addEventListener('click', () => {
                if (confirmOverlay) confirmOverlay.classList.remove('active');
                finalizarExamen(); // Solo si se confirma, finalizamos el examen
            });
        }

        if (confirmNoBtn) {
            confirmNoBtn.addEventListener('click', () => {
                if (confirmOverlay) confirmOverlay.classList.remove('active'); // Si no, solo cerramos la ventana
            });
        }

    }
    // 👇 REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DE RESULTADOS CON ESTE 👇
    if (window.location.pathname.endsWith('resultados.html')) {

        const crearNavegadorResultados = (totalPreguntas, respuestasUsuario, bloques) => {
            const navigatorContainer = document.getElementById('results-navigator');
            if (!navigatorContainer) return;
            navigatorContainer.innerHTML = '';
            const todasLasPreguntas = bloques.flatMap(b => b.preguntas);

            for (let i = 0; i < totalPreguntas; i++) {
                const navButton = document.createElement('button');
                navButton.classList.add('nav-question-btn');
                navButton.innerText = i + 1;

                const respuestaUsuario = respuestasUsuario[i];
                const respuestaCorrecta = todasLasPreguntas[i].respuesta;

                if (!respuestaUsuario) {
                    navButton.classList.add('blank');
                } else if (respuestaUsuario === respuestaCorrecta) {
                    navButton.classList.add('correct');
                } else {
                    navButton.classList.add('incorrect');
                }

                navButton.addEventListener('click', () => {
                    const resultItem = document.getElementById(`result-item-${i}`);
                    if (resultItem) {
                        resultItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        resultItem.style.transition = 'none';
                        resultItem.style.backgroundColor = '#e7f3ff';
                        setTimeout(() => {
                            resultItem.style.transition = 'background-color 0.5s ease';
                            resultItem.style.backgroundColor = '';
                        }, 500);
                    }
                });
                navigatorContainer.appendChild(navButton);
            }
        };

        const resultadosData = JSON.parse(localStorage.getItem('resultadosExamen'));
        const summaryCard = document.getElementById('summary-card');
        const resultsDetails = document.getElementById('results-details');

        if (resultadosData) {
            summaryCard.innerHTML = `
            <h4>${resultadosData.titulo}</h4>
            <div class="summary-grid">
                <div class="summary-item score"><span>Puntaje</span><p>${resultadosData.puntaje}%</p></div>
                <div class="summary-item correct"><span>Correctas</span><p>${resultadosData.correctas}</p></div>
                <div class="summary-item incorrect"><span>Incorrectas</span><p>${resultadosData.incorrectas}</p></div>
                <div class="summary-item blank"><span>En Blanco</span><p>${resultadosData.enBlanco}</p></div>
            </div>
            <div class="results-actions">
                <button id="practice-again-btn" class="btn-cta">Volver a Practicar</button>
            </div>
        `;

            crearNavegadorResultados(resultadosData.totalPreguntas, resultadosData.respuestasUsuario, resultadosData.bloques);

            resultsDetails.innerHTML = '';
            let questionCounter = 0;

            resultadosData.bloques.forEach(bloque => {
                if (bloque.contexto) {
                    const contextoDiv = document.createElement('div');
                    contextoDiv.classList.add('contexto-examen', 'contexto-resultado');
                    contextoDiv.innerHTML = `<p>${bloque.contexto.replace(/\n/g, '<br>')}</p>`;
                    resultsDetails.appendChild(contextoDiv);
                }
                if (bloque.imagen) {
                    const imagenEl = document.createElement('img');
                    imagenEl.classList.add('imagen-examen');
                    imagenEl.src = bloque.imagen;
                    resultsDetails.appendChild(imagenEl);
                }

                bloque.preguntas.forEach(pregunta => {
                    const index = questionCounter;
                    const respuestaUsuario = resultadosData.respuestasUsuario[index];
                    const esCorrecta = respuestaUsuario === pregunta.respuesta;

                    let statusClass = 'blank', statusIcon = '➖';
                    if (respuestaUsuario) {
                        statusClass = esCorrecta ? 'correct' : 'incorrect';
                        statusIcon = esCorrecta ? '✔️' : '❌';
                    }

                    const detailItem = document.createElement('div');
                    detailItem.id = `result-item-${index}`;
                    detailItem.classList.add('result-item', statusClass);

                    // CORRECCIÓN: Se añade el div del solucionario que faltaba
                    // Obtenemos el id y la sección del examen original que guardamos en el paso anterior
                    const examId = resultadosData.examenOriginal ? resultadosData.examenOriginal.id : 'unknown';
                    const seccion = resultadosData.examenOriginal ? resultadosData.examenOriginal.seccion : 'unknown';

                    detailItem.innerHTML = `
                        <div class="result-question">
                            <span class="status-icon">${statusIcon}</span>
                            <p><strong>Pregunta ${index + 1}:</strong> ${pregunta.pregunta}</p>
                        </div>
                        <div class="result-answers">
                            <p><strong>Tu respuesta:</strong> ${respuestaUsuario || 'No respondida'}</p>
                            ${!esCorrecta ? `<p class="correct-answer"><strong>Respuesta correcta:</strong> ${pregunta.respuesta}</p>` : ''}
                        </div>
                        <div class="solucionario">
                            <p><strong>Resumen:</strong> ${pregunta.respuestaCorta}</p>
                            <p><strong>Solucionario:</strong> ${pregunta.solucionario}</p>
                        </div>
                        <div class="result-actions-per-question">
                            <button class="btn-repaso" data-exam-id="${examId}" data-seccion="${seccion}" data-index="${index}">💾 Guardar para repasar</button>
                        </div>
                    `;
                    resultsDetails.appendChild(detailItem);

                    // AÑADIMOS LA LÓGICA PARA EL BOTÓN QUE ACABAMOS DE CREAR
                    const btnRepaso = detailItem.querySelector('.btn-repaso');
                    if (btnRepaso) {
                        btnRepaso.addEventListener('click', (e) => {
                            const id = e.target.dataset.examId;
                            const sec = e.target.dataset.seccion;
                            const idx = parseInt(e.target.dataset.index);
                            guardarParaRepaso(id, sec, idx); // Llamamos a la función que creamos al principio
                            e.target.innerText = '✔️ Guardado';
                            e.target.disabled = true;
                        });
                    }

                    questionCounter++;
                });
            });

            // CORRECCIÓN: Se añade la funcionalidad al botón
            const practiceAgainBtn = document.getElementById('practice-again-btn');
            if (practiceAgainBtn) {
                practiceAgainBtn.addEventListener('click', () => {
                    window.location.href = 'examenes.html';
                });
            }

        } else {
            summaryCard.innerHTML = "<p>No se encontraron resultados.</p>";
        }
    }

    // 👇 REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DEL DASHBOARD CON ESTE 👇

    if (window.location.pathname.endsWith('dashboard.html')) {
        // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
        const historyBody = document.getElementById('history-body');
        const kpiPromedioEl = document.getElementById('kpi-promedio');
        const kpiMejorEl = document.getElementById('kpi-mejor');
        const kpiTotalEl = document.getElementById('kpi-total');
        const kpiAreaEl = document.getElementById('kpi-area');
        const examFilterEl = document.getElementById('exam-filter');
        const examSortEl = document.getElementById('exam-sort');
        const ctx = document.getElementById('progressChart')?.getContext('2d');
        const loaderEl = document.getElementById('loader');
        const mainContentEl = document.getElementById('main-content');

        let fullHistorial = [];
        let chartInstance = null;

        // --- 2. FUNCIÓN PARA ACTUALIZAR GRÁFICO Y TABLA ---
        function actualizarGraficoYTabla(datos) {
            historyBody.innerHTML = '';
            if (datos.length === 0) {
                historyBody.innerHTML = '<tr><td colspan="4">No hay resultados para los filtros seleccionados.</td></tr>';
            } else {
                datos.forEach(data => {
                    const fecha = new Date(data.fecha).toLocaleDateString('es-PE');
                    const row = document.createElement('tr');
                    // --- INICIO DE LA CORRECCIÓN 1 ---
                    // Ahora usamos el ID único de Firebase (data.id) que es infalible.
                    row.innerHTML = `<td>${data.titulo}</td><td>${fecha}</td><td>${data.puntaje}%</td><td><button class="btn-review" data-id="${data.id}">Revisar</button></td>`;
                    // --- FIN DE LA CORRECCIÓN 1 ---
                    historyBody.appendChild(row);
                });
            }

            if (chartInstance) chartInstance.destroy();
            if (ctx && datos.length > 0) {
                const historialOrdenado = [...datos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                const labels = historialOrdenado.map(ex => new Date(ex.fecha).toLocaleDateString('es-PE'));
                const dataPoints = historialOrdenado.map(ex => parseFloat(ex.puntaje));
                chartInstance = new Chart(ctx, { /* ... configuración del gráfico sin cambios ... */
                    type: 'line', data: { labels, datasets: [{ label: 'Puntaje (%)', data: dataPoints, fill: true, backgroundColor: 'rgba(0, 123, 255, 0.1)', borderColor: '#007bff', tension: 0.2 }] },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }
                });
            }
        }

        // --- 3. FUNCIÓN PARA APLICAR FILTROS --- (Sin cambios)
        function aplicarFiltros() {
            const filtroValor = examFilterEl.value;
            const ordenValor = examSortEl.value;
            let datosProcesados = [...fullHistorial];
            if (filtroValor !== 'todos') {
                datosProcesados = datosProcesados.filter(ex => ex.titulo === filtroValor);
            }
            switch (ordenValor) {
                case 'reciente': datosProcesados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); break;
                case 'antiguo': datosProcesados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); break;
                case 'mejor': datosProcesados.sort((a, b) => parseFloat(b.puntaje) - parseFloat(a.puntaje)); break;
                case 'peor': datosProcesados.sort((a, b) => parseFloat(a.puntaje) - parseFloat(b.puntaje)); break;
            }
            actualizarGraficoYTabla(datosProcesados);
        }

        // --- 4. CARGA INICIAL DE DATOS ---
        auth.onAuthStateChanged(user => {
            if (user && db) {
                // 👇 REEMPLAZA TU BLOQUE db.collection CON ESTE 👇

                db.collection('usuarios').doc(user.uid).collection('historialExamenes').get()
                    .then(querySnapshot => {
                        if (querySnapshot.empty) {
                            historyBody.innerHTML = '<tr><td colspan="4">Aún no has completado ningún simulacro.</td></tr>';
                            loaderEl.style.display = 'none';
                            mainContentEl.classList.remove('content-hidden');
                            return;
                        }

                        querySnapshot.forEach(doc => fullHistorial.push({ id: doc.id, ...doc.data() }));

                        // Lógica de KPIs
                        const totalExamenes = fullHistorial.length;
                        kpiTotalEl.innerText = totalExamenes;
                        const sumaPuntajes = fullHistorial.reduce((acc, ex) => acc + parseFloat(ex.puntaje), 0);
                        kpiPromedioEl.innerText = `${(sumaPuntajes / totalExamenes).toFixed(1)}%`;
                        kpiMejorEl.innerText = `${Math.max(...fullHistorial.map(ex => parseFloat(ex.puntaje))).toFixed(1)}%`;
                        const statsPorArea = {};
                        fullHistorial.forEach(ex => {
                            const area = ex.titulo.split('|')[1]?.trim() || 'Desconocida';
                            if (!statsPorArea[area]) { statsPorArea[area] = { suma: 0, count: 0 }; }
                            statsPorArea[area].suma += parseFloat(ex.puntaje);
                            statsPorArea[area].count++;
                        });
                        let areaDebil = 'N/A', menorPromedio = 101;
                        for (const area in statsPorArea) {
                            const promedioArea = statsPorArea[area].suma / statsPorArea[area].count;
                            if (promedioArea < menorPromedio) { menorPromedio = promedioArea; areaDebil = area; }
                        }
                        kpiAreaEl.innerText = areaDebil;

                        // Llenar filtros
                        const examenesUnicos = [...new Set(fullHistorial.map(ex => ex.titulo))];
                        examenesUnicos.forEach(titulo => {
                            const option = document.createElement('option');
                            option.value = titulo;
                            option.innerText = titulo;
                            examFilterEl.appendChild(option);
                        });

                        examFilterEl.addEventListener('change', aplicarFiltros);
                        examSortEl.addEventListener('change', aplicarFiltros);

                        aplicarFiltros();

                        historyBody.addEventListener('click', (event) => {
                            if (event.target.classList.contains('btn-review')) {
                                const examDocId = event.target.dataset.id;
                                const examenOriginal = fullHistorial.find(ex => ex.id === examDocId);
                                if (examenOriginal) {
                                    localStorage.setItem('resultadosExamen', JSON.stringify(examenOriginal));
                                    window.location.href = 'resultados.html';
                                } else {
                                    alert("Error: No se pudieron cargar los detalles.");
                                }
                            }
                        });

                        loaderEl.style.display = 'none';
                        mainContentEl.classList.remove('content-hidden');
                    })
                    .catch(error => { // <-- AHORA SÍ EXISTE ESTE BLOQUE
                        console.error("Error al cargar historial:", error);
                        loaderEl.style.display = 'none';
                        mainContentEl.classList.remove('content-hidden');
                        historyBody.innerHTML = '<tr><td colspan="4">Error al cargar tu historial. Intenta recargar la página.</td></tr>';
                    });
            } else {
                // --- ESTE ES EL BLOQUE QUE ACABAS DE AÑADIR ---
                console.log("Dashboard: Usuario no autenticado o estado pendiente.");
                loaderEl.style.display = 'none';
                mainContentEl.classList.remove('content-hidden');
                historyBody.innerHTML = '<tr><td colspan="4">Debes iniciar sesión para ver tu progreso.</td></tr>';
            }
        });
    }



    // INICIA BLOQUE DE CÓDIGO PARA LA PÁGINA "MI REPASO" (repaso.html)
    // ========================================================================
    if (document.getElementById('lista-repaso')) {
        const listaRepasoContainer = document.getElementById('lista-repaso');
        const flashcardModalOverlay = document.getElementById('flashcard-modal-overlay');
        let mazoRepaso = JSON.parse(localStorage.getItem('mazoRepaso')) || [];

        // --- FUNCIÓN PARA MOSTRAR LAS PREGUNTAS EN LA PÁGINA ---
        const renderizarListaRepaso = () => {
            if (!listaRepasoContainer) return;
            listaRepasoContainer.innerHTML = '';

            if (mazoRepaso.length === 0) {
                listaRepasoContainer.innerHTML = `
                <h3>Mi Mazo de Repaso</h3>
                <p class="no-results">Aún no has guardado ninguna pregunta. Ve a la sección de resultados de un examen para guardarlas.</p>
            `;
            } else {
                listaRepasoContainer.innerHTML = '<h3>Mis Preguntas Guardadas</h3>';

                mazoRepaso.forEach(preguntaGuardada => {
                    const examData = examenes.find(e => e.id == preguntaGuardada.examenId);
                    if (!examData) return;

                    const questionKey = examData.questionKey;
                    const examQuestionSets = bancoDePreguntas[questionKey] || {};
                    const bloques = (preguntaGuardada.seccion === 'completo')
                        ? examQuestionSets['completo']
                        : examQuestionSets[preguntaGuardada.seccion] || [];

                    let flatExamQuestions = [];
                    if (bloques) {
                        bloques.forEach(b => flatExamQuestions.push(...(b.preguntas || [])));
                    }
                    const preguntaCompleta = flatExamQuestions[preguntaGuardada.indice];

                    if (preguntaCompleta) {
                        const itemPregunta = document.createElement('div');
                        itemPregunta.classList.add('repaso-item');
                        itemPregunta.dataset.idUnico = preguntaGuardada.idUnico;

                        itemPregunta.innerHTML = `
                    <div class="repaso-pregunta-texto">${preguntaCompleta.pregunta}</div>
                    <div class="repaso-pregunta-origen">${examData.proceso} ${examData.anio} - ${examData.especialidad}</div>
                    <button class="btn-eliminar-repaso" title="Eliminar de mi repaso" data-id-unico="${preguntaGuardada.idUnico}">🗑️</button>
                `;
                        listaRepasoContainer.appendChild(itemPregunta);
                    }
                });
            }
            document.getElementById('loader').style.display = 'none';
            document.getElementById('main-content').classList.remove('content-hidden');
        };

        // --- FUNCIÓN PARA MOSTRAR LA FLASHCARD INTERACTIVA (CORREGIDA) ---
        // 👇 REEMPLAZA TU FUNCIÓN mostrarFlashcard CON ESTA VERSIÓN MEJORADA 👇

        const mostrarFlashcard = (pregunta, contexto) => { // <-- Ahora acepta un 'contexto'
            let optionsHTML = '';
            pregunta.opciones.forEach(op => {
                optionsHTML += `<div class="option">${op}</div>`;
            });

            // --- INICIO DEL CAMBIO ---
            // Creamos el HTML para el contexto, pero solo si existe.
            let contextoHTML = '';
            if (contexto) {
                contextoHTML = `
            <div class="flashcard-contexto">
                <h4>Texto de Referencia</h4>
                <p>${contexto.replace(/\n/g, '<br>')}</p>
            </div>
        `;
            }
            // --- FIN DEL CAMBIO ---

            flashcardModalOverlay.innerHTML = `
    <div class="modal-container flashcard-modal">
        <button class="close-btn" id="flashcard-close-btn">&times;</button>
        <h3>Pregunta de Repaso</h3>
        
        ${contextoHTML} <p class="flashcard-question-text">${pregunta.pregunta}</p>
        <div class="options-container">${optionsHTML}</div>
        <button class="btn-cta" id="revelar-respuesta-btn">Revelar Respuesta</button>
        <div class="flashcard-solucion" id="flashcard-solucion">
            <p><strong>Respuesta Correcta:</strong> ${pregunta.respuesta}</p>
            <p><strong>Solucionario:</strong> ${pregunta.solucionario}</p>
        </div>
    </div>
    `;
            flashcardModalOverlay.classList.add('active');

            // (El resto de la función que maneja los clics se queda exactamente igual)
            const options = flashcardModalOverlay.querySelectorAll('.option');
            const revelarBtn = document.getElementById('revelar-respuesta-btn');
            const solucionDiv = document.getElementById('flashcard-solucion');

            options.forEach(optionNode => {
                optionNode.addEventListener('click', () => {
                    options.forEach(opt => opt.style.pointerEvents = 'none');
                    const textoSeleccionado = optionNode.innerText;

                    if (textoSeleccionado === pregunta.respuesta) {
                        optionNode.classList.add('correct');
                    } else {
                        optionNode.classList.add('incorrect');
                        options.forEach(opt => {
                            if (opt.innerText === pregunta.respuesta) opt.classList.add('correct');
                        });
                    }
                    solucionDiv.style.display = 'block';
                    revelarBtn.style.display = 'none';
                });
            });

            document.getElementById('flashcard-close-btn').addEventListener('click', () => flashcardModalOverlay.classList.remove('active'));

            revelarBtn.addEventListener('click', (e) => {
                solucionDiv.style.display = 'block';
                e.target.style.display = 'none';
                options.forEach(opt => {
                    if (opt.innerText === pregunta.respuesta) opt.classList.add('correct');
                    opt.style.pointerEvents = 'none';
                });
            });
        };

        // --- LÓGICA DE EVENTOS (CLICS EN LA PÁGINA) ---
        // 👇 REEMPLAZA EL BLOQUE listaRepasoContainer.addEventListener CON ESTE 👇

        listaRepasoContainer.addEventListener('click', (e) => {
            const btnEliminar = e.target.closest('.btn-eliminar-repaso');
            const itemRepaso = e.target.closest('.repaso-item');

            if (btnEliminar) {
                const idUnico = btnEliminar.dataset.idUnico;
                showConfirm('Confirmar Eliminación', '¿Estás seguro de que deseas eliminar esta pregunta de tu repaso?')
                    .then(() => {
                        mazoRepaso = mazoRepaso.filter(p => p.idUnico !== idUnico);
                        localStorage.setItem('mazoRepaso', JSON.stringify(mazoRepaso));
                        renderizarListaRepaso();
                        showToast('Pregunta eliminada.');
                    })
                    .catch(() => { /* No hacer nada si cancela */ });

                // --- INICIO DE LA CORRECCIÓN ---
            } else if (itemRepaso) {
                const idUnico = itemRepaso.dataset.idUnico;
                const preguntaGuardada = mazoRepaso.find(p => p.idUnico === idUnico);
                if (preguntaGuardada) {
                    const examData = examenes.find(ex => ex.id == preguntaGuardada.examenId);
                    if (!examData) return;

                    const questionKey = examData.questionKey;
                    const examQuestionSets = bancoDePreguntas[questionKey] || {};
                    const bloques = (preguntaGuardada.seccion === 'completo')
                        ? examQuestionSets['completo']
                        : examQuestionSets[preguntaGuardada.seccion] || [];

                    let preguntaCompleta = null;
                    let contextoDeLaPregunta = null;
                    let contadorGlobalPreguntas = 0;

                    // Buscamos la pregunta y su contexto sin aplanar el array
                    for (const bloque of bloques) {
                        const preguntasEnBloque = bloque.preguntas ? bloque.preguntas.length : 0;
                        if (preguntaGuardada.indice >= contadorGlobalPreguntas && preguntaGuardada.indice < (contadorGlobalPreguntas + preguntasEnBloque)) {
                            const indiceDentroDelBloque = preguntaGuardada.indice - contadorGlobalPreguntas;
                            preguntaCompleta = bloque.preguntas[indiceDentroDelBloque];
                            contextoDeLaPregunta = bloque.contexto; // ¡Aquí capturamos el contexto!
                            break; // Salimos del bucle una vez encontrada
                        }
                        contadorGlobalPreguntas += preguntasEnBloque;
                    }

                    if (preguntaCompleta) {
                        // Le pasamos la pregunta y el contexto (que puede ser null) a la función
                        mostrarFlashcard(preguntaCompleta, contextoDeLaPregunta);
                    }
                }
            }
            // --- FIN DE LA CORRECCIÓN ---
        });

        flashcardModalOverlay.addEventListener('click', (e) => {
            if (e.target === flashcardModalOverlay) {
                flashcardModalOverlay.classList.remove('active');
            }
        });

        // --- INICIALIZACIÓN ---
        renderizarListaRepaso();
    }
    // ========================================================================
    // FIN DEL BLOQUE PARA LA PÁGINA "MI REPASO"
    // ========================================================================
    // ========================================================================
    // INICIA VIGILANTE GLOBAL PARA ENLACES PROTEGIDOS (VERSIÓN CORREGIDA)
    // ========================================================================

    // Esta función configura los protectores de los enlaces.
    const setupProtectedLinks = () => {
        const enlacesProtegidos = ['nav-examenes-link', 'nav-repaso-link'];

        enlacesProtegidos.forEach(id => {
            const enlace = document.getElementById(id);
            if (enlace) {
                enlace.addEventListener('click', (event) => {
                    // En el momento del clic, volvemos a preguntar por el usuario.
                    // Esto asegura que la comprobación siempre es la más reciente.
                    if (!auth.currentUser) {
                        event.preventDefault(); // ¡Importante! Detenemos la navegación.
                        openModal(`Debes iniciar sesión para acceder a esta sección.`);
                    }
                    // Si hay un usuario, el enlace funciona normalmente.
                });
            }
        });
    };

    // OBSERVADOR PRINCIPAL DE AUTENTICACIÓN (onAuthStateChanged)
    // Este es el corazón de la solución.
    auth.onAuthStateChanged(user => {
        currentUser = user; // Actualizamos la variable global del usuario.
        setupUI(user);      // Actualizamos la interfaz (botones, perfil, etc.).

        // ¡LA MAGIA OCURRE AQUÍ!
        // Solo después de que Firebase haya hecho su primera comprobación
        // y sepamos si 'user' existe o no, activamos la lógica de los enlaces.
        setupProtectedLinks();
    });
    // Lógica para la PÁGINA DE PRÁCTICA (practica.html)
    if (document.getElementById('practica-container')) {
        // --- VARIABLES DE ESTADO ---
        let userAnswersPractica = {};
        let correctas = 0, incorrectas = 0;
        let incorrectasArr = [];
        let currentQuestionIndex = 0;
        let flatExamQuestions = [];
        // --- NUEVAS VARIABLES PARA EL TEMPORIZADOR ---
        let practicaTimeRemaining;
        let practicaTimerInterval;

        // --- ELEMENTOS DEL DOM ---
        const examTitleEl = document.getElementById('exam-title-practica');
        const questionTitleEl = document.getElementById('question-title-practica');
        const questionTextEl = document.getElementById('question-text-practica');
        const optionsContainerEl = document.getElementById('options-container-practica');
        const feedbackContainerEl = document.getElementById('feedback-container');
        const nextBtnEl = document.getElementById('next-btn-practica');
        const contextContainerEl = document.getElementById('context-container-practica');
        // --- NUEVO ELEMENTO DEL DOM PARA EL TIMER ---
        const practicaTimerEl = document.getElementById('practica-timer');

        // --- NUEVAS FUNCIONES PARA EL TEMPORIZADOR DE PRÁCTICA ---
        const updatePracticaTimerDisplay = () => {
            if (!practicaTimerEl) return;
            const minutes = Math.floor(practicaTimeRemaining / 60);
            const seconds = practicaTimeRemaining % 60;
            practicaTimerEl.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const startPracticaTimer = () => {
            clearInterval(practicaTimerInterval);
            practicaTimerInterval = setInterval(() => {
                if (practicaTimeRemaining > 0) {
                    practicaTimeRemaining--;
                    updatePracticaTimerDisplay();
                } else {
                    clearInterval(practicaTimerInterval);
                    // Opcional: finalizar la práctica si se acaba el tiempo
                }
            }, 1000);
        };

        const stopPracticaTimer = () => {
            clearInterval(practicaTimerInterval);
        };

        // --- FUNCIÓN DE RENDERIZADO (MODIFICADA) ---
        const renderPracticaQuestion = () => {
            if (feedbackContainerEl) feedbackContainerEl.innerHTML = '';
            if (nextBtnEl) nextBtnEl.disabled = true;

            if (currentQuestionIndex >= flatExamQuestions.length) {
                stopPracticaTimer(); // Detenemos el timer al finalizar
                // ... (el resto de la lógica de finalización se mantiene igual)
                const totalPreguntas = flatExamQuestions.length;
                const puntaje = totalPreguntas > 0 ? (correctas / totalPreguntas) * 100 : 0;
                if (nextBtnEl) nextBtnEl.style.display = 'none';
                if (contextContainerEl) contextContainerEl.innerHTML = '';
                questionTitleEl.innerText = "Práctica Finalizada";
                questionTextEl.innerHTML = `¡Aquí tienes tu resumen de la sesión!`;
                optionsContainerEl.innerHTML = `
            <div class="summary-card-practica">
                <div class="summary-item correct"><span>Correctas</span><p>${correctas}/${totalPreguntas}</p></div>
                <div class="summary-item incorrect"><span>Incorrectas</span><p>${incorrectas}/${totalPreguntas}</p></div>
                <div class="summary-item score"><span>Puntaje</span><p>${puntaje.toFixed(0)}%</p></div>
            </div>
            <div class="results-actions">
                <button id="review-practice-btn" class="btn-cta">Revisar Práctica</button>
                ${incorrectas > 0 ? '<button id="retry-incorrect-btn" class="btn-retry">Reintentar solo las incorrectas</button>' : ''}
                <button id="back-to-library-btn-practica" class="btn-secondary">Volver a la Biblioteca</button>
            </div>`;

                document.getElementById('back-to-library-btn-practica').addEventListener('click', () => { window.location.href = 'examenes.html'; });
                const retryBtn = document.getElementById('retry-incorrect-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        flatExamQuestions = [...incorrectasArr];
                        currentQuestionIndex = 0;
                        correctas = 0; incorrectas = 0;
                        userAnswersPractica = {}; incorrectasArr = [];
                        if (nextBtnEl) nextBtnEl.style.display = 'inline-block';
                        renderPracticaQuestion();
                    });
                }
                return;
            }

            // --- (El resto de la función renderPracticaQuestion y checkAnswer se mantiene igual que la tenías) ---
            const question = flatExamQuestions[currentQuestionIndex];
            const prevQuestion = currentQuestionIndex > 0 ? flatExamQuestions[currentQuestionIndex - 1] : null;
            const esNuevoGrupo = !prevQuestion || prevQuestion.idGrupo !== question.idGrupo;

            if (contextContainerEl && esNuevoGrupo) {
                contextContainerEl.innerHTML = '';
                if (question.contexto) {
                    contextContainerEl.innerHTML = `<div class="contexto-examen"><p>${question.contexto.replace(/\n/g, '<br>')}</p></div>`;
                }
                if (question.imagen) {
                    const img = document.createElement('img');
                    img.src = question.imagen;
                    img.classList.add('imagen-examen');
                    contextContainerEl.appendChild(img);
                }
            }
            if (questionTitleEl) questionTitleEl.innerText = `Pregunta ${currentQuestionIndex + 1} de ${flatExamQuestions.length}`;
            if (questionTextEl) questionTextEl.innerText = question.pregunta;
            if (optionsContainerEl) optionsContainerEl.innerHTML = '';

            question.opciones.forEach(opcion => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('option');
                optionDiv.innerText = opcion;
                optionDiv.addEventListener('click', () => checkAnswer(opcion, question.respuesta, question.solucionario));
                if (optionsContainerEl) optionsContainerEl.appendChild(optionDiv);
            });
        };

        const checkAnswer = (selectedOption, correctOption, solucionario) => {
            // ... (esta función se mantiene exactamente igual, no necesita cambios)
            userAnswersPractica[currentQuestionIndex] = selectedOption;
            const options = optionsContainerEl.querySelectorAll('.option');
            options.forEach(optionNode => {
                optionNode.style.pointerEvents = 'none';
                if (optionNode.innerText === correctOption) optionNode.classList.add('correct');
                if (optionNode.innerText === selectedOption && selectedOption !== correctOption) {
                    optionNode.classList.add('incorrect');
                }
            });
            const params = new URLSearchParams(window.location.search);
            const examId = params.get('id');
            const seccion = params.get('seccion');
            const botonGuardarHTML = `<button class="btn-repaso" data-exam-id="${examId}" data-seccion="${seccion}" data-index="${currentQuestionIndex}">💾 Guardar para repasar</button>`;
            if (selectedOption === correctOption) {
                correctas++;
                feedbackContainerEl.innerHTML = `<div class="feedback correct">¡Correcto! <br><br> ${solucionario}</div> ${botonGuardarHTML}`;
            } else {
                incorrectas++;
                incorrectasArr.push(flatExamQuestions[currentQuestionIndex]);
                feedbackContainerEl.innerHTML = `
                <div class="feedback incorrect">Incorrecto.</div>
                <div class="solucionario"><p><strong>Solucionario:</strong> ${solucionario}</p></div>
                ${botonGuardarHTML}
            `;
            }
            const btnRepaso = feedbackContainerEl.querySelector('.btn-repaso');
            if (btnRepaso) {
                btnRepaso.addEventListener('click', (e) => {
                    const id = e.target.dataset.examId;
                    const sec = e.target.dataset.seccion;
                    const idx = parseInt(e.target.dataset.index);
                    guardarParaRepaso(id, sec, idx);
                    e.target.innerText = '✔️ Guardado';
                    e.target.disabled = true;
                });
            }
            if (nextBtnEl) nextBtnEl.disabled = false;
        };

        // --- LÓGICA PRINCIPAL (MODIFICADA PARA INCLUIR EL TIMER) ---
        const params = new URLSearchParams(window.location.search);
        const examId = params.get('id');
        const examData = examenes.find(e => e.id == examId);

        if (examData) {
            if (examTitleEl) examTitleEl.innerText = `Modo Práctica: ${examData.proceso} ${examData.especialidad}`;
            const questionKey = examData.questionKey;
            const seccion = params.get('seccion');
            const examQuestionSets = bancoDePreguntas[questionKey] || {};
            const bloques = examQuestionSets[seccion] || [];

            flatExamQuestions = [];
            bloques.forEach(bloque => {
                bloque.preguntas.forEach(pregunta => {
                    flatExamQuestions.push({
                        ...pregunta,
                        contexto: bloque.contexto,
                        imagen: bloque.imagen,
                        idGrupo: bloque.idGrupo
                    });
                });
            });

            // --- CÁLCULO DEL TIEMPO E INICIO DEL CONTADOR ---
            const totalPreguntasExamenCompleto = examData.preguntas;
            const tiempoTotalExamenCompleto = examData.tiempo * 60; // en segundos

            if (seccion === 'completo') {
                practicaTimeRemaining = tiempoTotalExamenCompleto;
            } else {
                practicaTimeRemaining = Math.round((flatExamQuestions.length / totalPreguntasExamenCompleto) * tiempoTotalExamenCompleto);
            }

            updatePracticaTimerDisplay();
            startPracticaTimer();
            // ---------------------------------------------

            renderPracticaQuestion();
        }

        if (nextBtnEl) nextBtnEl.addEventListener('click', () => {
            currentQuestionIndex++;
            renderPracticaQuestion();
        });
        // Activamos el marcador para el texto del contexto y de la pregunta

    }

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

});