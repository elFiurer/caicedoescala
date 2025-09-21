// Contenido completo y corregido para script.js

document.addEventListener('DOMContentLoaded', () => {
    const setupMobileMenu = () => {
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const navLinks = document.querySelector('.nav-links');

        if (hamburgerBtn && navLinks) {
            hamburgerBtn.addEventListener('click', () => {
                navLinks.classList.toggle('nav-links-mobile-active');
            });
        }
    };
    setupMobileMenu(); //
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
    let inicializarPaginaExamenes;
    let inicializarDashboard;
    let inicializarPaginaRepaso;


    // --- 2. BASE DE DATOS LOCAL DE EXÁMENES Y PREGUNTAS (Global) ---

    // --- 2. BASE DE DATOS DE EXÁMENES (CARGA DINÁMICA) ---

    // Usaremos una variable 'cache' para no tener que leer el archivo JSON a cada rato.
    let todosLosExamenesCache = [];

    // Esta función se encarga de leer tu manifiesto examenes.json
    const getTodosLosExamenes = async () => {
        if (todosLosExamenesCache.length === 0) {
            try {
                // Como el manifiesto está en la raíz, lo llamamos directamente.
                const response = await fetch('examenes.json');
                if (!response.ok) throw new Error('No se pudo cargar la lista de exámenes.');
                todosLosExamenesCache = await response.json();
            } catch (error) {
                console.error("Error fatal al cargar el manifiesto de exámenes:", error);
                // CAMBIO AQUÍ: Mostramos un mensaje amigable al usuario.
                showToast('Error al cargar los exámenes. Intenta refrescar la página.');
                return []; // Devuelve un array vacío en caso de error.
            }
        }
        return todosLosExamenesCache;
    };
    // Esta función nos ayudará a comparar textos sin importar tildes o mayúsculas.
    const normalizarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .normalize('NFD') // Separa las tildes de las letras
            .replace(/[\u0300-\u036f]/g, "") // Elimina los signos de tilde
            .toLowerCase(); // Convierte todo a minúsculas
    };
    const sanitizarHTML = (texto) => {
        if (!texto) return '';
        // Esta expresión busca y elimina cualquier etiqueta <script> y su contenido.
        const regex = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi;
        return texto.replace(regex, '');
    };
    // Esta función arma un examen completo, pidiendo el archivo genérico y el específico.
    // ▼▼▼ REEMPLAZA TU FUNCIÓN getBancoDePreguntas CON ESTA VERSIÓN DE DIAGNÓSTICO Y CORRECCIÓN FINAL ▼▼▼

    const getBancoDePreguntas = async (examId) => {
        const examenes = await getTodosLosExamenes();
        const examData = examenes.find(e => e.id == examId);

        if (!examData || !examData.archivos) {
            console.error(`No se encontró data para el examen con id ${examId}.`);
            return null;
        }

        // --- INICIA EL MODO DE DIAGNÓSTICO ---
        console.log("--- INICIANDO DIAGNÓSTICO DE CARGA DE EXAMEN ---");
        console.log("1. DATOS DEL EXAMEN SELECCIONADO:", examData);
        console.log("2. ARCHIVOS A BUSCAR:", examData.archivos);
        // --- FIN DEL MODO DE DIAGNÓSTICO ---

        try {
            const fetchPromises = [];
            if (examData.archivos.generico) {
                fetchPromises.push(fetch(examData.archivos.generico).then(res => res.json()));
            }
            if (examData.archivos.especifico) {
                fetchPromises.push(fetch(examData.archivos.especifico).then(res => res.json()));
            }

            const allDataObjects = await Promise.all(fetchPromises);

            // --- MÁS DIAGNÓSTICO ---
            console.log("3. DATOS CRUDOS DESCARGADOS (JSONs):", allDataObjects);
            // --- FIN DE DIAGNÓSTICO ---

            const bancoFusionado = {};
            for (const dataObject of allDataObjects) {
                for (const key in dataObject) {
                    if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
                        if (bancoFusionado[key] && Array.isArray(bancoFusionado[key])) {
                            bancoFusionado[key] = bancoFusionado[key].concat(dataObject[key]);
                        } else {
                            bancoFusionado[key] = dataObject[key];
                        }
                    }
                }
            }

            // --- DIAGNÓSTICO FINAL ANTES DE CONSTRUIR ---
            console.log("4. BANCO FUSIONADO (Resultado de la mezcla):", bancoFusionado);
            console.log("5. CLAVES/SECCIONES ENCONTRADAS:", Object.keys(bancoFusionado));
            // --- FIN DE DIAGNÓSTICO ---

            // --- INICIA LA CORRECCIÓN MÁS ROBUSTA POSIBLE ---
            // Esta nueva lógica busca las claves ignorando mayúsculas, minúsculas y tildes,
            // solucionando posibles errores de tipeo en los archivos JSON.
            const findKeyInsensitive = (obj, keyToFind) => {
                const normalizedKeyToFind = normalizarTexto(keyToFind);
                return Object.keys(obj).find(k => normalizarTexto(k) === normalizedKeyToFind);
            };

            if (!bancoFusionado.completo) {
                const clKey = findKeyInsensitive(bancoFusionado, 'Comprensión Lectora');
                const rlKey = findKeyInsensitive(bancoFusionado, 'Razonamiento Lógico');
                const cpKey = findKeyInsensitive(bancoFusionado, 'Conocimientos Pedagógicos');

                console.log("6. CLAVES NORMALIZADAS ENCONTRADAS:", { cl: clKey, rl: rlKey, cp: cpKey });

                bancoFusionado.completo = [
                    ...(clKey ? bancoFusionado[clKey] : []),
                    ...(rlKey ? bancoFusionado[rlKey] : []),
                    ...(cpKey ? bancoFusionado[cpKey] : [])
                ];
            }
            // --- FIN DE LA CORRECCIÓN MÁS ROBUSTA ---

            console.log("7. BANCO FINAL CONSTRUIDO:", bancoFusionado);
            console.log("--- FIN DEL DIAGNÓSTICO ---");

            return bancoFusionado;

        } catch (error) {
            console.error("ERROR FATAL AL CONSTRUIR EL BANCO DE PREGUNTAS:", error);
            // Mostrar un mensaje al usuario aquí podría ser útil
            showToast('Error crítico al cargar las preguntas. Revisa la consola.');
            return null;
        }
    };
    // 👇 REEMPLAZA tu función guardarParaRepaso con esta 👇
    const guardarParaRepaso = (examenId, seccion, indicePregunta) => {
        const mazoRepaso = JSON.parse(localStorage.getItem('mazoRepaso')) || [];
        const idUnicoPregunta = `${examenId}-${seccion}-${indicePregunta}`;

        if (mazoRepaso.some(p => p.idUnico === idUnicoPregunta)) {
            showToast('Esta pregunta ya está en tu Repaso.'); // <-- CAMBIO AQUÍ
            return;
        }

        mazoRepaso.unshift({
            idUnico: idUnicoPregunta,
            examenId: examenId,
            seccion: seccion,
            indice: indicePregunta,
            fechaGuardado: new Date().toISOString()
        });

        localStorage.setItem('mazoRepaso', JSON.stringify(mazoRepaso));
        showToast('¡Pregunta guardada en Mi Repaso!'); // <-- CAMBIO AQUÍ
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
    // ▼▼▼ AÑADE ESTA NUEVA FUNCIÓN A TU SCRIPT.JS ▼▼▼
    const showAuthAlert = (title, message, onAcceptCallback) => {
        // Primero, nos aseguramos de que no haya otros modales de alerta abiertos.
        const existingModal = document.querySelector('.auth-alert-modal');
        if (existingModal) return;

        const alertModalOverlay = document.createElement('div');
        alertModalOverlay.className = 'modal-overlay active';

        alertModalOverlay.innerHTML = `
            <div class="modal-container auth-alert-modal">
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="auth-alert-buttons">
                    <button class="btn-cta" id="auth-alert-accept-btn">Aceptar</button>
                </div>
            </div>
        `;

        document.body.appendChild(alertModalOverlay);

        document.getElementById('auth-alert-accept-btn').addEventListener('click', () => {
            // Si le pasamos una acción personalizada (como abrir el modal de login), la ejecuta.
            if (typeof onAcceptCallback === 'function') {
                document.body.removeChild(alertModalOverlay);
                onAcceptCallback();
            } else {
                // Si no, hace lo de siempre: redirige a la página de inicio.
                window.location.href = 'index.html';
            }
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

        // 1. Comprobamos si la guía ya ha sido vista antes o si no existe el overlay.
        if (!overlay || localStorage.getItem('guiaHighlighterVista') === 'true') {
            return; // Si ya se vio o no existe el elemento, no hacemos nada.
        }

        // 2. Si no se ha visto, la mostramos.
        overlay.style.display = 'flex';

        const closeBtn = document.getElementById('close-guide-btn');
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            // 3. Guardamos en la memoria que el usuario ya vio la guía para no mostrarla de nuevo.
            localStorage.setItem('guiaHighlighterVista', 'true');
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

        // --- 1. LIMPIAR ESTADO ANTERIOR (AHORA MÁS COMPLETO) ---
        const oldLoginBtn = document.getElementById('login-btn');
        const oldUserProfile = mainNav.querySelector('.user-profile');
        const oldLogoutLink = mainNav.querySelector('.logout-link'); // <-- Buscamos también el botón de logout viejo
        if (oldLoginBtn) oldLoginBtn.remove();
        if (oldUserProfile) oldUserProfile.remove();
        if (oldLogoutLink) oldLogoutLink.remove(); // <-- Y lo eliminamos si existe

        // --- 2. LÓGICA DE BOTONES GLOBALES (en la barra de navegación) ---
        if (user) {
            // PARTE A: Creamos el perfil (foto y nombre) y lo ponemos en la barra principal.
            const userProfile = document.createElement('div');
            userProfile.classList.add('user-profile');
            userProfile.innerHTML = `
        <img src="${user.photoURL || 'default-avatar.png'}" alt="${user.displayName}" class="profile-pic">
        <span class="profile-name">${user.displayName.split(' ')[0]}</span>
    `; // <-- ¡Hemos quitado el botón de aquí!
            mainNav.appendChild(userProfile);

            // PARTE B: Creamos el botón "Cerrar Sesión" y lo metemos DENTRO del menú.
            const navLinksMenu = mainNav.querySelector('.nav-links');
            if (navLinksMenu) {
                const logoutLi = document.createElement('li');
                logoutLi.classList.add('logout-link'); // Clase para darle estilos
                logoutLi.innerHTML = `<button class="btn-logout" id="logout-btn">Cerrar Sesión</button>`;
                navLinksMenu.appendChild(logoutLi); // <-- Lo añadimos al final del <ul> del menú

                // Finalmente, le damos vida al botón.
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
            }

        } else {
            // ... (el código para cuando no hay usuario sigue igual)
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
        // --- 3. LÓGICA DE BOTONES ESPECÍFICOS (en el cuerpo de la página de inicio) ---
        // --- 3. LÓGICA DE BOTONES ESPECÍFICOS (en el cuerpo de la página de inicio) ---
        const ctaBtn = document.getElementById('cta-btn');
        if (ctaBtn) { // Solo si estamos en una página que tiene este botón
            // 1. Clonamos el botón. Esto crea una copia exacta pero SIN los event listeners (órdenes) anteriores.
            const ctaBtnLimpio = ctaBtn.cloneNode(true);
            // 2. Reemplazamos el botón viejo y "sucio" por nuestro clon limpio en la página.
            ctaBtn.parentNode.replaceChild(ctaBtnLimpio, ctaBtn);

            // 3. Ahora, trabajamos ÚNICAMENTE con el botón limpio (ctaBtnLimpio).
            if (user) {
                ctaBtnLimpio.innerText = "Ir a mis exámenes";
                ctaBtnLimpio.addEventListener('click', () => {
                    window.location.href = 'examenes.html';
                });
            } else {
                ctaBtnLimpio.innerText = "Empieza a Practicar Gratis";
                ctaBtnLimpio.addEventListener('click', () => {
                    openModal();
                });
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
    // ========================================================================
    // INICIA BLOQUE PARA LA PÁGINA "EXÁMENES" (EXAMENES.HTML)
    // ========================================================================
    // ========================================================================
    // INICIA BLOQUE CORREGIDO PARA LA PÁGINA "EXÁMENES" (EXAMENES.HTML)
    // ========================================================================
    if (document.getElementById('filters-container')) {

        inicializarPaginaExamenes = async () => {

            const filtersContainer = document.getElementById('filters-container');
            const examsListContainer = document.getElementById('exams-list');
            const sectionModal = document.getElementById('section-modal-overlay');
            const sectionModalTitle = document.getElementById('section-modal-title');
            const sectionButtons = document.querySelector('.section-buttons');
            const sectionCloseBtn = document.getElementById('section-close-btn');

            const examenes = await getTodosLosExamenes();
            if (!examenes || examenes.length === 0) {
                document.getElementById('loader').style.display = 'none';
                document.getElementById('main-content').classList.remove('content-hidden');
                examsListContainer.innerHTML = '<p class="no-results">Error: No se pudo cargar la lista de exámenes.</p>';
                return;
            }

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
                    examenCard.innerHTML = `<div class="examen-info"><h3>${examen.proceso} ${examen.anio} - ${examen.modalidad}</h3><p>${examen.nivel} - ${examen.especialidad}</p></div><div class="examen-details"><span>${examen.preguntas} preguntas</span><span>${examen.tiempo} min</span></div><div class="examen-actions"><button class="btn-practica" data-id="${examen.id}">Modo Práctica</button><button class="btn-simulacro" data-id="${examen.id}">Modo Simulacro</button></div>`;
                    examsListContainer.appendChild(examenCard);
                });
                const handleExamButtonClick = (e, mode) => {
                    const examId = e.target.dataset.id;
                    const examData = examenes.find(ex => ex.id == examId);

                    if (examData && examData.proceso === 'Ascenso') {
                        const title = `Examen de Ascenso`;
                        const message = `Estás a punto de iniciar el examen completo de ${examData.preguntas} preguntas. ¿Estás listo?`;
                        showConfirm(title, message)
                            .then(() => {
                                window.location.href = `${mode}.html?id=${examId}&seccion=completo`;
                            })
                            .catch(() => {
                                console.log("Inicio de examen de Ascenso cancelado por el usuario.");
                            });

                    } else {
                        openSectionModal(examId, mode);
                    }
                };
                document.querySelectorAll('.btn-simulacro').forEach(button => {
                    button.addEventListener('click', (e) => handleExamButtonClick(e, 'simulacro'));
                });
                document.querySelectorAll('.btn-practica').forEach(button => {
                    button.addEventListener('click', (e) => handleExamButtonClick(e, 'practica'));
                });
            };

            const openSectionModal = (examId, mode) => {
                const examData = examenes.find(e => e.id == examId);
                sectionModalTitle.innerText = `Modo ${mode}`;
                sectionButtons.dataset.examId = examId;
                sectionButtons.dataset.mode = mode;
                if (examData.proceso === 'Ascenso') {
                    sectionButtons.innerHTML = `<button class="btn-section" data-section="completo"><h4>Examen Completo</h4><p>${examData.preguntas} preguntas - ${examData.tiempo} min</p></button>`;
                } else {
                    sectionButtons.innerHTML = `<button class="btn-section" data-section="completo">Examen Completo</button><button class="btn-section" data-section="Comprensión Lectora">Comprensión Lectora</button><button class="btn-section" data-section="Razonamiento Lógico">Razonamiento Lógico</button><button class="btn-section" data-section="Conocimientos Pedagógicos">Conocimientos Pedagógicos</button>`;
                }
                sectionModal.classList.add('active');
            };

            const popularFiltros = () => {
                const procesoSelect = document.getElementById('filtro-proceso');
                const anioSelect = document.getElementById('filtro-anio');
                const nivelSelect = document.getElementById('filtro-nivel');
                const especialidadSelect = document.getElementById('filtro-especialidad');
                const procesoActual = procesoSelect.value;
                const anioActual = anioSelect.value;
                const nivelActual = nivelSelect.value;
                let examenesProceso = examenes;
                if (procesoActual !== 'todos') {
                    examenesProceso = examenes.filter(e => e.proceso === procesoActual);
                }
                const aniosDisponibles = [...new Set(examenesProceso.map(e => e.anio))].sort((a, b) => b - a);
                let examenesAnio = examenesProceso;
                if (anioActual !== 'todos') {
                    examenesAnio = examenesProceso.filter(e => e.anio == anioActual);
                }
                const nivelesDisponibles = [...new Set(examenesAnio.map(e => e.nivel))];
                let examenesNivel = examenesAnio;
                if (nivelActual !== 'todos') {
                    examenesNivel = examenesAnio.filter(e => e.nivel === nivelActual);
                }
                const especialidadesDisponibles = [...new Set(examenesNivel.map(e => e.especialidad))];
                actualizarSelectHTML(anioSelect, aniosDisponibles, anioActual);
                actualizarSelectHTML(nivelSelect, nivelesDisponibles, nivelActual);
                actualizarSelectHTML(especialidadSelect, especialidadesDisponibles, especialidadSelect.value);
            };

            const actualizarSelectHTML = (selectElement, opciones, valorPrevio) => {
                const primerOptionTexto = selectElement.options[0].text;
                selectElement.innerHTML = `<option value="todos">${primerOptionTexto}</option>`;
                opciones.forEach(opcion => {
                    const isSelected = opcion == valorPrevio ? 'selected' : '';
                    selectElement.innerHTML += `<option value="${opcion}" ${isSelected}>${opcion}</option>`;
                });
            };

            const procesos = [...new Set(examenes.map(e => e.proceso))];
            filtersContainer.innerHTML = `<select id="filtro-proceso"><option value="todos">Selecciona un Proceso</option>${procesos.map(p => `<option value="${p}">${p}</option>`).join('')}</select><select id="filtro-anio"><option value="todos">Selecciona un Año</option></select><select id="filtro-nivel"><option value="todos">Selecciona un Nivel</option></select><select id="filtro-especialidad"><option value="todos">Selecciona un Área</option></select><button id="btn-buscar" class="btn-buscar">Buscar</button>`;

            popularFiltros();

            document.getElementById('filtro-proceso').addEventListener('change', popularFiltros);
            document.getElementById('filtro-anio').addEventListener('change', popularFiltros);
            document.getElementById('filtro-nivel').addEventListener('change', popularFiltros);
            document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);

            examsListContainer.innerHTML = '<p class="no-results">Usa los filtros y presiona "Buscar" para ver los exámenes disponibles.</p>';

            sectionCloseBtn.addEventListener('click', () => sectionModal.classList.remove('active'));
            sectionButtons.addEventListener('click', (e) => {
                const button = e.target.closest('.btn-section');
                if (!button) return;
                const examId = sectionButtons.dataset.examId;
                const mode = sectionButtons.dataset.mode;
                const section = button.dataset.section;
                window.location.href = `${mode}.html?id=${examId}&seccion=${section}`;
            });

            document.getElementById('loader').style.display = 'none';
            document.getElementById('main-content').classList.remove('content-hidden');
        };
    }
    // ========================================================================
    // FIN DEL BLOQUE PARA LA PÁGINA "EXÁMENES"
    // ========================================================================
    mostrarGuiaHighlighterSiEsNecesario('practica');

    // REEMPLAZA ESTA SECCIÓN EN TU SCRIPT.JS

    // REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DE SIMULACRO

    // Bloque Final para SIMULACRO.HTML
    if (document.getElementById('questions-container')) {
        (async () => {
            mostrarGuiaHighlighterSiEsNecesario('simulacro');
            // --- VARIABLES DE ESTADO Y ELEMENTOS DEL DOM ---
            let userAnswers = {};
            let examQuestions = [];
            let flaggedQuestions = new Set();
            let timeRemaining;
            let timerInterval;
            let isPaused = false;

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

            // --- FUNCIONES COMPLETAS ---

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
                let questionCounter = 0;
                if (!Array.isArray(bloques)) { return; }

                const todasLasPreguntas = bloques.flatMap(b => b.preguntas || []);
                crearNavegador(todasLasPreguntas.length);

                bloques.forEach((bloque, index) => {
                    const bloqueId = `bloque-${index}`;
                    const bloqueWrapper = document.createElement('div');
                    bloqueWrapper.id = bloqueId;
                    bloqueWrapper.className = 'bloque-wrapper';

                    let bloqueHTML = `<h2 class="group-title">CASO ${index + 1}</h2>`;

                    if (bloque.contexto) {
                        bloqueHTML += `<div class="contexto-examen contexto-bloque"><p>${bloque.contexto.replace(/\n/g, '<br>')}</p></div>`;
                    }
                    const imagenDeBloque = bloque.imagen || bloque.Imagen;
                    if (imagenDeBloque) {
                        bloqueHTML += `<img src="${imagenDeBloque}" alt="Imagen del bloque" class="imagen-examen">`;
                    }

                    if (bloque.preguntas && Array.isArray(bloque.preguntas)) {
                        bloque.preguntas.forEach(pregunta => {
                            const questionIndex = questionCounter;
                            let optionsHTML = '';
                            if (pregunta.opciones && Array.isArray(pregunta.opciones)) {
                                pregunta.opciones.forEach(opcion => {
                                    optionsHTML += `<div class="option" data-question-index="${questionIndex}">${opcion}</div>`;
                                });
                            }

                            let contenidoPreguntaHTML = '';
                            if (pregunta.contexto) {
                                contenidoPreguntaHTML += `<div class="contexto-examen contexto-pregunta"><p>${pregunta.contexto.replace(/\n/g, '<br>')}</p></div>`;
                            }
                            const imagenDePregunta = pregunta.imagen || pregunta.Imagen;
                            if (imagenDePregunta) {
                                contenidoPreguntaHTML += `<div class="imagen-pregunta-especifica"><img src="${imagenDePregunta}" alt="Imagen de la pregunta" class="imagen-examen"></div>`;
                            }
                            contenidoPreguntaHTML += `<p>${pregunta.pregunta}</p>`;

                            bloqueHTML += `
                                <div id="question-wrapper-${questionIndex}" class="question-wrapper">
                                    <div class="question-header">
                                        <p><strong>Pregunta ${questionIndex + 1}</strong></p>
                                        <button class="flag-btn" data-index="${questionIndex}" title="Marcar para revisar más tarde">🚩</button>
                                    </div>
                                    ${contenidoPreguntaHTML}
                                    <div class="options-container">${optionsHTML}</div>
                                </div>`;

                            questionCounter++;
                        });
                    }

                    bloqueWrapper.innerHTML = bloqueHTML;
                    questionsContainer.appendChild(bloqueWrapper);

                    const currentBlock = document.getElementById(bloqueId);
                    currentBlock.querySelectorAll('.flag-btn').forEach(flagBtn => {
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
                    });
                    currentBlock.querySelectorAll('.option').forEach(opt => {
                        opt.addEventListener('click', (e) => {
                            const idx = parseInt(e.target.dataset.questionIndex);
                            userAnswers[idx] = e.target.innerText;
                            const parentOptions = e.target.closest('.options-container').querySelectorAll('.option');
                            parentOptions.forEach(o => o.classList.remove('selected'));
                            e.target.classList.add('selected');
                            const navButton = document.querySelector(`.nav-question-btn[data-index="${idx}"]`);
                            if (navButton) navButton.classList.add('answered');
                        });
                    });
                });
            };
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
                    examenOriginal: { id: params.get('id'), seccion: params.get('seccion') },
                    totalPreguntas, correctas, incorrectas, enBlanco,
                    puntaje: puntaje.toFixed(2),
                    bloques: examQuestions,
                    respuestasUsuario: userAnswers,
                    fecha: new Date().toISOString()
                };
                localStorage.setItem('resultadosExamen', JSON.stringify(resultados));
                if (currentUser && db) {
                    db.collection('usuarios').doc(currentUser.uid).collection('historialExamenes').add(resultados)
                        .then(() => console.log("¡Historial del examen guardado en Firestore!"))
                        .catch(error => console.error("Error al guardar el historial en Firestore:", error));
                }
                if (timerEl) timerEl.style.display = 'none';
                if (navigatorContainer) navigatorContainer.style.display = 'none';
                if (pauseBtn) pauseBtn.style.display = 'none';
                if (finishBtn) finishBtn.style.display = 'none';
                examTitle.innerText = 'Resultados del Examen';
                questionsContainer.innerHTML = `<div class="summary-card"><div class="summary-exam-title">${resultados.titulo}</div><div class="summary-cards-grid"><div class="summary-card-item score"><span>Puntaje</span><p>${resultados.puntaje}%</p></div><div class="summary-card-item correct"><span>Correctas</span><p>${resultados.correctas}</p></div><div class="summary-card-item incorrect"><span>Incorrectas</span><p>${resultados.incorrectas}</p></div><div class="summary-card-item blank"><span>En Blanco</span><p>${resultados.enBlanco}</p></div></div><div class="results-actions"><button id="review-exam-btn" class="btn-cta">Revisar Detalle</button><button id="back-to-library-btn" class="btn-secondary">Volver a la Biblioteca</button></div></div>`;
                document.getElementById('review-exam-btn').addEventListener('click', () => { window.location.href = 'resultados.html'; });
                document.getElementById('back-to-library-btn').addEventListener('click', () => { window.location.href = 'examenes.html'; });
            };

            // --- LÓGICA PRINCIPAL DE CARGA ---
            const params = new URLSearchParams(window.location.search);
            const examId = params.get('id');
            const seccion = params.get('seccion');
            const examData = (await getTodosLosExamenes()).find(e => e.id == examId);
            const examQuestionSets = await getBancoDePreguntas(examId);

            if (examData && examQuestionSets && seccion) {
                examTitle.innerText = `${examData.proceso} ${examData.anio} - ${examData.especialidad} | ${seccion.replace(/_/g, ' ').toUpperCase()}`;
                const seccionNormalizada = normalizarTexto(seccion);
                const claveCorrecta = Object.keys(examQuestionSets).find(k => normalizarTexto(k) === seccionNormalizada);
                examQuestions = claveCorrecta ? examQuestionSets[claveCorrecta] : [];
                const totalPreguntasSeccion = (examQuestions || []).reduce((total, bloque) => total + (bloque.preguntas ? bloque.preguntas.length : 0), 0);

                if (totalPreguntasSeccion > 0) {
                    const totalPreguntasExamenCompleto = examData.preguntas;
                    const tiempoTotalExamenCompleto = examData.tiempo * 60;
                    if (seccion === 'completo') { timeRemaining = tiempoTotalExamenCompleto; } else { timeRemaining = Math.round((totalPreguntasSeccion / totalPreguntasExamenCompleto) * tiempoTotalExamenCompleto); }
                    mostrarExamenCompleto(examQuestions);
                    updateTimerDisplay();
                    startTimer();
                    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
                    if (pauseOverlay) pauseOverlay.addEventListener('click', togglePause);
                } else {
                    questionsContainer.innerHTML = "<p>Error: No se encontraron preguntas para esta sección del examen.</p>";
                }
            } else {
                examTitle.innerText = "Error al cargar el examen";
                questionsContainer.innerHTML = "<p>No se especificó un examen o una sección válida.</p>";
            }

            if (finishBtn) { finishBtn.addEventListener('click', () => { if (confirmOverlay) confirmOverlay.classList.add('active'); }); }
            if (confirmYesBtn) { confirmYesBtn.addEventListener('click', () => { if (confirmOverlay) confirmOverlay.classList.remove('active'); finalizarExamen(); }); }
            if (confirmNoBtn) { confirmNoBtn.addEventListener('click', () => { if (confirmOverlay) confirmOverlay.classList.remove('active'); }); }
        })();
    }
    // 👇 REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DE RESULTADOS CON ESTE 👇
    // ▼▼▼ REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DE RESULTADOS CON ESTE ▼▼▼
    // ▼▼▼ REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DE RESULTADOS CON ESTA VERSIÓN FINAL Y ROBUSTA ▼▼▼
    if (document.getElementById('summary-card')) {

        const crearNavegadorResultados = (totalPreguntas, respuestasUsuario, bloques) => {
            const navigatorContainer = document.getElementById('results-navigator');
            if (!navigatorContainer) return;
            navigatorContainer.innerHTML = '';

            // Hacemos el flatMap más seguro contra bloques que no tengan 'preguntas'
            const todasLasPreguntas = bloques.flatMap(b => b.preguntas || []);

            for (let i = 0; i < totalPreguntas; i++) {
                const navButton = document.createElement('button');
                navButton.classList.add('nav-question-btn');
                navButton.innerText = i + 1;

                // Aseguramos que la pregunta exista antes de leer sus propiedades
                const preguntaActual = todasLasPreguntas[i];
                if (!preguntaActual) continue;

                const respuestaUsuario = respuestasUsuario[i];
                const respuestaCorrecta = preguntaActual.respuesta;

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

        // CORRECCIÓN CLAVE: Verificamos que 'resultadosData' y 'resultadosData.bloques' existan correctamente
        if (resultadosData && resultadosData.bloques && Array.isArray(resultadosData.bloques)) {
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

            resultadosData.bloques.forEach((bloque, index) => {
                if (!bloque) return; // Si un bloque es nulo, lo saltamos

                const groupTitle = document.createElement('h2');
                groupTitle.className = 'group-title';
                groupTitle.innerText = `CASO ${index + 1}`;
                resultsDetails.appendChild(groupTitle);

                if (bloque.contexto) {
                    const contextoDiv = document.createElement('div');
                    contextoDiv.classList.add('contexto-examen', 'contexto-resultado');
                    contextoDiv.innerHTML = `<p>${sanitizarHTML(bloque.contexto).replace(/\n/g, '<br>')}</p>`;
                    resultsDetails.appendChild(contextoDiv);
                }

                const imagenDeBloque = bloque.imagen || bloque.Imagen;
                if (imagenDeBloque) {
                    const imagenEl = document.createElement('img');
                    imagenEl.classList.add('imagen-examen');
                    imagenEl.src = imagenDeBloque;
                    resultsDetails.appendChild(imagenEl);
                }

                // La protección más importante: solo continuamos si 'bloque.preguntas' es un array
                if (bloque.preguntas && Array.isArray(bloque.preguntas)) {
                    bloque.preguntas.forEach(pregunta => {
                        if (!pregunta) return; // Si una pregunta es nula, la saltamos

                        const preguntaIndex = questionCounter;
                        const respuestaUsuario = resultadosData.respuestasUsuario[preguntaIndex];
                        const esCorrecta = respuestaUsuario === pregunta.respuesta;
                        const estaEnBlanco = !respuestaUsuario;

                        let statusClass = '';
                        if (estaEnBlanco) statusClass = 'blank';
                        else if (esCorrecta) statusClass = 'correct';
                        else statusClass = 'incorrect';

                        const resultItem = document.createElement('div');
                        resultItem.classList.add('result-item', statusClass);
                        resultItem.id = `result-item-${preguntaIndex}`;

                        let optionsHTML = '';
                        (pregunta.opciones || []).forEach(opcion => {
                            let optionClass = 'option';
                            if (opcion === pregunta.respuesta) optionClass += ' correct-answer';
                            if (opcion === respuestaUsuario && !esCorrecta) optionClass += ' incorrect-answer';
                            optionsHTML += `<div class="${optionClass}">${opcion}</div>`;
                        });

                        let contenidoPreguntaHTML = '';
                        if (pregunta.contexto) {
                            contenidoPreguntaHTML += `<div class="contexto-examen contexto-pregunta"><p>${sanitizarHTML(pregunta.contexto).replace(/\n/g, '<br>')}</p></div>`;
                        }
                        const imagenDePregunta = pregunta.imagen || pregunta.Imagen;
                        if (imagenDePregunta) {
                            contenidoPreguntaHTML += `<div class="imagen-pregunta-especifica"><img src="${imagenDePregunta}" alt="Imagen de la pregunta" class="imagen-examen"></div>`;
                        }

                        const examId = resultadosData.examenOriginal.id;
                        const seccion = resultadosData.examenOriginal.seccion;

                        resultItem.innerHTML = `
                        <div class="result-question-header">
                            <strong>Pregunta ${preguntaIndex + 1}</strong>
                            <span>Tu respuesta: ${respuestaUsuario || 'No contestada'}</span>
                        </div>
                        <div class="result-question-content">
                            ${contenidoPreguntaHTML}
                            <p>${sanitizarHTML(pregunta.pregunta)}</p>
                        </div>
                        <div class="options-container">${optionsHTML}</div>
                        <div class="solucionario">
                            <p><strong>Solucionario:</strong> ${sanitizarHTML(pregunta.solucionario)}</p>
                        </div>
                        <div class="result-item-actions">
                            <button class="btn-repaso" data-exam-id="${examId}" data-seccion="${seccion}" data-index="${preguntaIndex}" title="Guardar esta pregunta en Mi Repaso">💾 Guardar para repasar</button>
                        </div>
                    `;
                        resultsDetails.appendChild(resultItem);
                        questionCounter++;
                    });
                }
            });

            // La lógica para activar el botón, que ahora sí se ejecutará
            resultsDetails.addEventListener('click', (e) => {
                const saveButton = e.target.closest('.btn-repaso');
                if (saveButton) {
                    const { examId, seccion, index } = saveButton.dataset;
                    guardarParaRepaso(examId, seccion, parseInt(index));
                    saveButton.innerText = '✔️ Guardado';
                    saveButton.disabled = true;
                }
            });

            const practiceAgainBtn = document.getElementById('practice-again-btn');
            if (practiceAgainBtn) {
                practiceAgainBtn.addEventListener('click', () => {
                    window.location.href = 'examenes.html';
                });
            }

        } else {
            summaryCard.innerHTML = "<p>No se encontraron resultados o los datos están corruptos.</p>";
            console.error("Error: 'resultadosExamen' no se encontró en localStorage o no contiene una propiedad 'bloques' válida.", resultadosData);
        }
    }

    // 👇 REEMPLAZA TU BLOQUE DEL DASHBOARD CON ESTA VERSIÓN CORREGIDA Y FINAL 👇

    // Bloque Definitivo para DASHBOARD.HTML (Con Modal Profesional)
    // ========================================================================
    // INICIA BLOQUE PARA LA PÁGINA "MI RENDIMIENTO" (DASHBOARD.HTML)
    // ========================================================================
    // ========================================================================
    // INICIA BLOQUE PARA LA PÁGINA "MI RENDIMIENTO" (DASHBOARD.HTML)
    // ========================================================================
    if (document.getElementById('progressChart')) {

        // --- GUARDIÁN DE AUTENTICACIÓN SIMPLE ---
        // --- GUARDIÁN DE AUTENTICACIÓN MEJORADO ---
        inicializarDashboard = (user) => {
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

            function actualizarGraficoYTabla(datos) {
                historyBody.innerHTML = '';
                if (datos.length === 0) {
                    historyBody.innerHTML = '<tr><td colspan="4">No hay resultados para los filtros seleccionados.</td></tr>';
                } else {
                    datos.forEach(data => {
                        const fecha = new Date(data.fecha).toLocaleDateString('es-PE');
                        const row = document.createElement('tr');
                        row.innerHTML = `<td>${data.titulo}</td><td>${fecha}</td><td>${data.puntaje}%</td><td><button class="btn-review" data-id="${data.id}">Revisar</button></td>`;
                        historyBody.appendChild(row);
                    });
                }

                if (chartInstance) chartInstance.destroy();
                if (ctx && datos.length > 0) {
                    const historialOrdenado = [...datos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                    const labels = historialOrdenado.map(ex => new Date(ex.fecha).toLocaleDateString('es-PE'));
                    const dataPoints = historialOrdenado.map(ex => parseFloat(ex.puntaje));
                    chartInstance = new Chart(ctx, {
                        type: 'line', data: { labels, datasets: [{ label: 'Puntaje (%)', data: dataPoints, fill: true, backgroundColor: 'rgba(0, 123, 255, 0.1)', borderColor: '#007bff', tension: 0.2 }] },
                        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }
                    });
                }
            }

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

            if (db) {
                db.collection('usuarios').doc(user.uid).collection('historialExamenes').get()
                    .then(querySnapshot => {
                        if (querySnapshot.empty) {
                            historyBody.innerHTML = '<tr><td colspan="4">Aún no has completado ningún simulacro.</td></tr>';
                            loaderEl.style.display = 'none';
                            mainContentEl.classList.remove('content-hidden');
                            return;
                        }

                        querySnapshot.forEach(doc => fullHistorial.push({ id: doc.id, ...doc.data() }));

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
                    .catch(error => {
                        console.error("Error al cargar historial:", error);
                        loaderEl.style.display = 'none';
                        mainContentEl.classList.remove('content-hidden');
                        historyBody.innerHTML = '<tr><td colspan="4">Error al cargar tu historial. Intenta recargar la página.</td></tr>';
                    });
            }
        };
    }
    // ========================================================================
    // FIN DEL BLOQUE PARA LA PÁGINA "MI RENDIMIENTO"
    // ========================================================================
    // ========================================================================
    // FIN DEL BLOQUE PARA LA PÁGINA "MI RENDIMIENTO"
    // ========================================================================



    // INICIA BLOQUE DE CÓDIGO PARA LA PÁGINA "MI REPASO" (repaso.html)
    // ========================================================================
    // REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA "MI REPASO"

    // INICIA BLOQUE DE CÓDIGO PARA LA PÁGINA "MI REPASO" (repaso.html)
    // ========================================================================
    // Bloque Definitivo para MI REPASO (repaso.html) - Completo y Verificado
    // ========================================================================
    // INICIA BLOQUE PARA LA PÁGINA "MI REPASO" (REPASO.HTML)
    // ========================================================================
    // ========================================================================
    // INICIA BLOQUE PARA LA PÁGINA "MI REPASO" (REPASO.HTML)
    // ========================================================================
    if (document.getElementById('lista-repaso')) {

        // --- GUARDIÁN DE AUTENTICACIÓN SIMPLE ---
        // --- GUARDIÁN DE AUTENTICACIÓN MEJORADO ---
        inicializarPaginaRepaso = (user) => {
            const listaRepasoContainer = document.getElementById('lista-repaso');
            const flashcardModalOverlay = document.getElementById('flashcard-modal-overlay');
            let mazoRepaso = JSON.parse(localStorage.getItem('mazoRepaso')) || [];

            const renderizarListaRepaso = async () => {
                if (!listaRepasoContainer) return;
                listaRepasoContainer.innerHTML = '';

                if (mazoRepaso.length === 0) {
                    listaRepasoContainer.innerHTML = `<h3>Mi Mazo de Repaso</h3><p class="no-results">Aún no has guardado ninguna pregunta. Ve a la sección de resultados de un examen para guardarlas.</p>`;
                } else {
                    listaRepasoContainer.innerHTML = '<h3>Mis Preguntas Guardadas</h3>';

                    // 1. Agrupamos las preguntas por examen para no repetir peticiones
                    const preguntasAgrupadas = mazoRepaso.reduce((acc, pregunta) => {
                        if (!acc[pregunta.examenId]) {
                            acc[pregunta.examenId] = [];
                        }
                        acc[pregunta.examenId].push(pregunta);
                        return acc;
                    }, {});

                    const todosLosExamenes = await getTodosLosExamenes();
                    const fragmentoHTML = document.createDocumentFragment();

                    // 2. Iteramos sobre los exámenes únicos, no sobre cada pregunta
                    for (const examenId in preguntasAgrupadas) {
                        const examData = todosLosExamenes.find(e => e.id == examenId);
                        if (!examData) continue;

                        // Pedimos el banco de preguntas UNA SOLA VEZ por examen
                        const examQuestionSets = await getBancoDePreguntas(examenId);
                        if (!examQuestionSets) continue;

                        const preguntasDeEsteExamen = preguntasAgrupadas[examenId];

                        // 3. Procesamos todas las preguntas guardadas para este examen
                        for (const preguntaGuardada of preguntasDeEsteExamen) {
                            const seccionNormalizada = normalizarTexto(preguntaGuardada.seccion);
                            const claveCorrecta = Object.keys(examQuestionSets).find(k => normalizarTexto(k) === seccionNormalizada);
                            const bloques = claveCorrecta ? examQuestionSets[claveCorrecta] : [];

                            let flatExamQuestions = [];
                            bloques.forEach(b => flatExamQuestions.push(...(b.preguntas || [])));
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
                                fragmentoHTML.appendChild(itemPregunta);
                            }
                        }
                    }
                    // Invertimos el orden al final para mostrar las más recientes primero
                    listaRepasoContainer.appendChild(fragmentoHTML);
                }

                document.getElementById('loader').style.display = 'none';
                document.getElementById('main-content').classList.remove('content-hidden');
            };

            const mostrarFlashcard = (pregunta, contextoBloque) => {
                let optionsHTML = '';
                pregunta.opciones.forEach(op => {
                    optionsHTML += `<div class="option">${op}</div>`;
                });
                const contextoFinal = pregunta.contexto || contextoBloque;
                let contenidoPrevioHTML = '';
                if (contextoFinal) {
                    contenidoPrevioHTML += `<div class="flashcard-contexto"><h4>Contexto</h4><p>${contextoFinal.replace(/\n/g, '<br>')}</p></div>`;
                }
                const imagenDePregunta = pregunta.imagen || pregunta.Imagen;
                if (imagenDePregunta) {
                    contenidoPrevioHTML += `<div class="imagen-pregunta-especifica"><img src="${imagenDePregunta}" alt="Imagen de la pregunta" class="imagen-examen"></div>`;
                }
                flashcardModalOverlay.innerHTML = `
                <div class="modal-container flashcard-modal">
                    <button class="close-btn" id="flashcard-close-btn">&times;</button>
                    <h3>Pregunta de Repaso</h3>
                    ${contenidoPrevioHTML} 
                    <p class="flashcard-question-text">${pregunta.pregunta}</p>
                    <div class="options-container">${optionsHTML}</div>
                    <button class="btn-cta" id="revelar-respuesta-btn">Revelar Respuesta</button>
                    <div class="flashcard-solucion" id="flashcard-solucion">
                        <p><strong>Respuesta Correcta:</strong> ${pregunta.respuesta}</p>
                        <p><strong>Solucionario:</strong> ${pregunta.solucionario}</p>
                    </div>
                </div>`;
                flashcardModalOverlay.classList.add('active');
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

            listaRepasoContainer.addEventListener('click', async (e) => {
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

                } else if (itemRepaso) {
                    const idUnico = itemRepaso.dataset.idUnico;
                    const preguntaGuardada = mazoRepaso.find(p => p.idUnico === idUnico);
                    if (preguntaGuardada) {
                        const examQuestionSets = await getBancoDePreguntas(preguntaGuardada.examenId);
                        if (!examQuestionSets) {
                            alert('Error: No se pudo cargar la información de esta pregunta.');
                            return;
                        }
                        const seccionNormalizada = normalizarTexto(preguntaGuardada.seccion);
                        const claveCorrecta = Object.keys(examQuestionSets).find(k => normalizarTexto(k) === seccionNormalizada);
                        const bloques = claveCorrecta ? examQuestionSets[claveCorrecta] : [];
                        let preguntaCompleta = null;
                        let contextoDeLaPregunta = null;
                        let contadorGlobalPreguntas = 0;
                        for (const bloque of bloques) {
                            const preguntasEnBloque = bloque.preguntas ? bloque.preguntas.length : 0;
                            if (preguntaGuardada.indice >= contadorGlobalPreguntas && preguntaGuardada.indice < (contadorGlobalPreguntas + preguntasEnBloque)) {
                                const indiceDentroDelBloque = preguntaGuardada.indice - contadorGlobalPreguntas;
                                preguntaCompleta = bloque.preguntas[indiceDentroDelBloque];
                                contextoDeLaPregunta = bloque.contexto;
                                break;
                            }
                            contadorGlobalPreguntas += preguntasEnBloque;
                        }
                        if (preguntaCompleta) {
                            mostrarFlashcard(preguntaCompleta, contextoDeLaPregunta);
                        }
                    }
                }
            });

            flashcardModalOverlay.addEventListener('click', (e) => {
                if (e.target === flashcardModalOverlay) {
                    flashcardModalOverlay.classList.remove('active');
                }
            });

            renderizarListaRepaso();
        };
    }
    // ========================================================================
    // FIN DEL BLOQUE PARA LA PÁGINA "MI REPASO"
    // ========================================================================
    // ========================================================================
    // FIN DEL BLOQUE PARA LA PÁGINA "MI REPASO"
    // ========================================================================
    // ========================================================================
    // ========================================================================
    // INICIA VIGILANTE GLOBAL PARA ENLACES PROTEGIDOS (VERSIÓN CORREGIDA)
    // ========================================================================

    // Esta función configura los protectores de los enlaces.
    // ========================================================================
    // INICIA VIGILANTE GLOBAL PARA ENLACES PROTEGIDOS (VERSIÓN FINAL)
    // ========================================================================
    const setupProtectedLinks = () => {
        // Asegúrate de que tu enlace de "Mi Rendimiento" en el HTML tenga el id="nav-rendimiento-link"
        const enlacesProtegidos = ['nav-examenes-link', 'nav-repaso-link', 'nav-rendimiento-link'];

        enlacesProtegidos.forEach(id => {
            const enlace = document.getElementById(id);
            if (enlace) {
                enlace.addEventListener('click', (event) => {
                    if (!auth.currentUser) {
                        event.preventDefault(); // Detenemos la navegación

                        // LLAMAMOS AL AVISO SIMPLE, y al aceptar, ABRIMOS EL MODAL DE LOGIN
                        showAuthAlert(
                            'Acceso Restringido',
                            'Debes iniciar sesión para acceder a esta sección.',
                            () => { openModal(); } // Esta es la acción personalizada
                        );
                    }
                });
            }
        });
    };

    // OBSERVADOR PRINCIPAL DE AUTENTICACIÓN (onAuthStateChanged)
    // OBSERVADOR PRINCIPAL DE AUTENTICACIÓN (VERSIÓN DEFINITIVA)
    // Este es el único lugar que decide si un usuario está autenticado o no.
    // OBSERVADOR PRINCIPAL DE AUTENTICACIÓN (VERSIÓN A PRUEBA DE ERRORES)
    auth.onAuthStateChanged(user => {
        currentUser = user;
        setupUI(user);
        setupProtectedLinks();

        const loader = document.getElementById('loader');

        if (user) {
            // Si el usuario existe, llamamos a la función SOLO SI esta ha sido definida en la página actual.
            if (typeof inicializarPaginaExamenes === 'function') inicializarPaginaExamenes();
            if (typeof inicializarDashboard === 'function') inicializarDashboard(user);
            if (typeof inicializarPaginaRepaso === 'function') inicializarPaginaRepaso(user);
        } else {
            // Si el usuario NO existe, y estamos en una página protegida, mostramos el aviso.
            if (loader) loader.style.display = 'none';

            if (document.getElementById('filters-container')) {
                showAuthAlert('Acceso Restringido', 'Inicia sesión para ver los exámenes.');
            }
            if (document.getElementById('progressChart')) {
                showAuthAlert('Acceso Restringido', 'Inicia sesión para ver tu rendimiento.');
            }
            if (document.getElementById('lista-repaso')) {
                showAuthAlert('Acceso Restringido', 'Inicia sesión para ver tu mazo de repaso.');
            }
        }
    });
    // Lógica para la PÁGINA DE PRÁCTICA (practica.html)
    // REEMPLAZA EL BLOQUE COMPLETO DE LA PÁGINA DE PRÁCTICA

    // Bloque Final para PRACTICA.HTML
    // Bloque Final para PRACTICA.HTML (Versión con botón "Finalizar")
    // Bloque Definitivo para PRACTICA.HTML (Con todas las mejoras)
    // Bloque Definitivo para PRACTICA.HTML (Con Títulos de Bloque)
    // Bloque Definitivo para PRACTICA.HTML (Corregido y Completo)
    // Bloque Definitivo para PRACTICA.HTML (Absolutamente Completo y Verificado)
    if (document.getElementById('practica-container')) {
        (async () => {
            // --- VARIABLES DE ESTADO ---
            let userAnswersPractica = {}, correctas = 0, incorrectas = 0, incorrectasArr = [], currentQuestionIndex = 0, flatExamQuestions = [], practicaTimeRemaining, practicaTimerInterval;
            let groupCounter = 0;
            let lastGroupId = null;

            // --- ELEMENTOS DEL DOM ---
            const examTitleEl = document.getElementById('exam-title-practica');
            const questionTitleEl = document.getElementById('question-title-practica');
            const questionTextEl = document.getElementById('question-text-practica');
            const optionsContainerEl = document.getElementById('options-container-practica');
            const feedbackContainerEl = document.getElementById('feedback-container');
            const nextBtnEl = document.getElementById('next-btn-practica');
            const contextContainerEl = document.getElementById('context-container-practica');
            const practicaTimerEl = document.getElementById('practica-timer');
            const finishBtnEl = document.getElementById('finish-btn-practica');

            // --- FUNCIONES AUXILIARES ---
            const updatePracticaTimerDisplay = () => { if (!practicaTimerEl) return; const minutes = Math.floor(practicaTimeRemaining / 60); const seconds = practicaTimeRemaining % 60; practicaTimerEl.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; };
            const startPracticaTimer = () => { clearInterval(practicaTimerInterval); practicaTimerInterval = setInterval(() => { if (practicaTimeRemaining > 0) { practicaTimeRemaining--; updatePracticaTimerDisplay(); } else { clearInterval(practicaTimerInterval); } }, 1000); };
            const stopPracticaTimer = () => { clearInterval(practicaTimerInterval); };

            // --- FUNCIÓN PARA FINALIZAR (AHORA COMPLETA) ---
            const finalizarPractica = () => {
                stopPracticaTimer();
                const totalPreguntas = flatExamQuestions.length;
                const puntaje = totalPreguntas > 0 ? (correctas / totalPreguntas) * 100 : 0;
                if (nextBtnEl) nextBtnEl.style.display = 'none';
                if (finishBtnEl) finishBtnEl.style.display = 'none';
                if (contextContainerEl) contextContainerEl.innerHTML = '';
                if (feedbackContainerEl) feedbackContainerEl.innerHTML = '';
                const imgPreguntaContainer = document.getElementById('imagen-pregunta-practica');
                if (imgPreguntaContainer) imgPreguntaContainer.innerHTML = '';
                questionTitleEl.innerText = "Práctica Finalizada";
                questionTextEl.innerHTML = `¡Aquí tienes tu resumen de la sesión!`;
                optionsContainerEl.innerHTML = `<div class="summary-card-practica"><div class="summary-item correct"><span>Correctas</span><p>${correctas}/${totalPreguntas}</p></div><div class="summary-item incorrect"><span>Incorrectas</span><p>${incorrectas}/${totalPreguntas}</p></div><div class="summary-item score"><span>Puntaje</span><p>${puntaje.toFixed(0)}%</p></div></div><div class="results-actions"><button id="review-practice-btn" class="btn-cta">Revisar Práctica</button>${incorrectas > 0 ? '<button id="retry-incorrect-btn" class="btn-retry">Reintentar solo las incorrectas</button>' : ''}<button id="back-to-library-btn-practica" class="btn-secondary">Volver a la Biblioteca</button></div>`;

                const reviewBtn = document.getElementById('review-practice-btn');
                if (reviewBtn) {
                    reviewBtn.addEventListener('click', () => {
                        const bloquesReconstruidos = [];
                        const grupos = {};
                        flatExamQuestions.forEach(pregunta => {
                            const idGrupo = pregunta.idGrupo;
                            if (!grupos[idGrupo]) {
                                grupos[idGrupo] = { contexto: pregunta.contextoBloque, imagen: pregunta.imagenBloque, preguntas: [] };
                            }
                            // --- INICIA EL ARREGLO ---
                            // Creamos una versión "limpia" de la pregunta, quitando los datos extra de la práctica.
                            const preguntaLimpia = {
                                pregunta: pregunta.pregunta,
                                opciones: pregunta.opciones,
                                respuesta: pregunta.respuesta,
                                solucionario: pregunta.solucionario,
                                contexto: pregunta.contextoPregunta, // Usamos el contexto específico de la pregunta
                                imagen: pregunta.imagenPregunta      // Usamos la imagen específica de la pregunta
                            };

                            // Guardamos el objeto limpio, no el original que tenía datos extra.
                            grupos[idGrupo].preguntas.push(preguntaLimpia);
                            // --- FIN DEL ARREGLO ---
                        });
                        for (const id in grupos) { bloquesReconstruidos.push(grupos[id]); }
                        const params = new URLSearchParams(window.location.search);
                        const resultados = {
                            titulo: examTitleEl.innerText,
                            examenOriginal: { id: params.get('id'), seccion: params.get('seccion') },
                            totalPreguntas: totalPreguntas,
                            correctas: correctas,
                            incorrectas: incorrectas,
                            enBlanco: totalPreguntas - (correctas + incorrectas),
                            puntaje: puntaje.toFixed(2),
                            bloques: bloquesReconstruidos,
                            respuestasUsuario: userAnswersPractica,
                            fecha: new Date().toISOString()
                        };
                        localStorage.setItem('resultadosExamen', JSON.stringify(resultados));
                        window.location.href = 'resultados.html';
                    });
                }

                document.getElementById('back-to-library-btn-practica').addEventListener('click', () => { window.location.href = 'examenes.html'; });

                const retryBtn = document.getElementById('retry-incorrect-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        flatExamQuestions = [...incorrectasArr];
                        currentQuestionIndex = 0; correctas = 0; incorrectas = 0; userAnswersPractica = {}; incorrectasArr = [];
                        groupCounter = 0; lastGroupId = null;
                        if (nextBtnEl) nextBtnEl.style.display = 'inline-block';
                        if (finishBtnEl) finishBtnEl.style.display = 'inline-block';
                        renderPracticaQuestion();
                    });
                }
            };

            // --- FUNCIÓN PARA RENDERIZAR PREGUNTA (AHORA COMPLETA) ---
            const renderPracticaQuestion = () => {
                if (feedbackContainerEl) feedbackContainerEl.innerHTML = '';
                if (nextBtnEl) nextBtnEl.disabled = true;
                if (currentQuestionIndex >= flatExamQuestions.length) {
                    finalizarPractica();
                    return;
                }
                const question = flatExamQuestions[currentQuestionIndex];
                const esNuevoGrupo = lastGroupId !== question.idGrupo;
                if (esNuevoGrupo) {
                    lastGroupId = question.idGrupo;
                    groupCounter++;
                    contextContainerEl.innerHTML = '';
                    const groupTitle = document.createElement('h2');
                    groupTitle.className = 'group-title';
                    groupTitle.innerText = `CASO ${groupCounter}`;
                    contextContainerEl.appendChild(groupTitle);
                    if (question.contextoBloque) {
                        const contextoDiv = document.createElement('div');
                        contextoDiv.className = 'contexto-examen contexto-bloque';
                        contextoDiv.innerHTML = `<p>${question.contextoBloque.replace(/\n/g, '<br>')}</p>`;
                        contextContainerEl.appendChild(contextoDiv);
                    }
                    if (question.imagenBloque) {
                        const img = document.createElement('img');
                        img.src = question.imagenBloque;
                        img.classList.add('imagen-examen');
                        contextContainerEl.appendChild(img);
                    }
                }
                if (questionTitleEl) questionTitleEl.innerText = `Pregunta ${currentQuestionIndex + 1} de ${flatExamQuestions.length}`;
                let imgPreguntaContainer = document.getElementById('imagen-pregunta-practica');
                if (!imgPreguntaContainer) {
                    imgPreguntaContainer = document.createElement('div');
                    imgPreguntaContainer.id = 'imagen-pregunta-practica';
                    questionTextEl.parentNode.insertBefore(imgPreguntaContainer, questionTextEl);
                }
                let contenidoPreguntaHTML = '';
                if (question.contextoPregunta) {
                    contenidoPreguntaHTML += `<div class="contexto-examen contexto-pregunta"><p>${question.contextoPregunta.replace(/\n/g, '<br>')}</p></div>`;
                }
                if (question.imagenPregunta) {
                    contenidoPreguntaHTML += `<div class="imagen-pregunta-especifica"><img src="${question.imagenPregunta}" alt="Imagen de la pregunta" class="imagen-examen"></div>`;
                }
                imgPreguntaContainer.innerHTML = contenidoPreguntaHTML;
                if (questionTextEl) questionTextEl.innerText = question.pregunta;

                if (optionsContainerEl) optionsContainerEl.innerHTML = '';
                if (question.opciones && Array.isArray(question.opciones)) {
                    question.opciones.forEach(opcion => {
                        const optionDiv = document.createElement('div');
                        optionDiv.classList.add('option');
                        optionDiv.innerText = opcion;
                        optionDiv.addEventListener('click', () => checkAnswer(opcion, question.respuesta, question.solucionario));
                        if (optionsContainerEl) optionsContainerEl.appendChild(optionDiv);
                    });
                }
            };

            // --- FUNCIÓN PARA CHEQUEAR RESPUESTA (AHORA COMPLETA) ---
            const checkAnswer = (selectedOption, correctOption, solucionario) => {
                userAnswersPractica[currentQuestionIndex] = selectedOption;
                const options = optionsContainerEl.querySelectorAll('.option');
                options.forEach(optionNode => {
                    optionNode.style.pointerEvents = 'none';
                    if (optionNode.innerText === correctOption) {
                        optionNode.classList.add('correct');
                    }
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
                    feedbackContainerEl.innerHTML = `<div class="feedback incorrect">Incorrecto.</div><div class="solucionario"><p><strong>Solucionario:</strong> ${solucionario}</p></div>${botonGuardarHTML}`;
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

            // --- LÓGICA PRINCIPAL DE ARRANQUE (AHORA COMPLETA) ---
            const params = new URLSearchParams(window.location.search);
            const examId = params.get('id');
            const seccion = params.get('seccion');
            const examData = (await getTodosLosExamenes()).find(e => e.id == examId);
            const examQuestionSets = await getBancoDePreguntas(examId);

            if (examData && examQuestionSets) {
                examTitleEl.innerText = `Modo Práctica: ${examData.proceso} ${examData.especialidad}`;
                const seccionNormalizada = normalizarTexto(seccion);
                const claveCorrecta = Object.keys(examQuestionSets).find(k => normalizarTexto(k) === seccionNormalizada);
                const bloques = claveCorrecta ? examQuestionSets[claveCorrecta] : [];

                bloques.forEach(bloque => {
                    bloque.preguntas.forEach(pregunta => {
                        flatExamQuestions.push({
                            ...pregunta,
                            contextoBloque: bloque.contexto,
                            contextoPregunta: pregunta.contexto,
                            imagenBloque: bloque.imagen || bloque.Imagen,
                            imagenPregunta: pregunta.imagen || pregunta.Imagen,
                            idGrupo: bloque.idGrupo || `grupo-${bloque.contexto}`
                        });
                    });
                });

                const totalPreguntasExamenCompleto = examData.preguntas;
                const tiempoTotalExamenCompleto = examData.tiempo * 60;
                if (seccion === 'completo') {
                    practicaTimeRemaining = tiempoTotalExamenCompleto;
                } else {
                    practicaTimeRemaining = Math.round((flatExamQuestions.length / totalPreguntasExamenCompleto) * tiempoTotalExamenCompleto);
                }

                updatePracticaTimerDisplay();
                startPracticaTimer();
                renderPracticaQuestion();
            } else {
                examTitleEl.innerText = "Error";
                questionTextEl.innerText = "No se pudieron cargar las preguntas para este examen.";
            }

            if (nextBtnEl) nextBtnEl.addEventListener('click', () => {
                currentQuestionIndex++;
                renderPracticaQuestion();
            });

            if (finishBtnEl) {
                finishBtnEl.addEventListener('click', () => {
                    showConfirm('Finalizar Práctica', '¿Estás seguro de que deseas terminar ahora? Verás un resumen de tu progreso hasta este punto.')
                        .then(() => {
                            finalizarPractica();
                        })
                        .catch(() => {
                            console.log("El usuario canceló la finalización de la práctica.");
                        });
                });
            }
        })();
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