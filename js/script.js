document.addEventListener('DOMContentLoaded', () => {
            const ticketForm = document.getElementById('ticket-form');
            const openTicketList = document.getElementById('open-ticket-list');
            const archivedTicketList = document.getElementById('archived-ticket-list');
            const noOpenTicketsMessage = document.getElementById('no-open-tickets-message');
            const noArchivedTicketsMessage = document.getElementById('no-archived-tickets-message');
            const ticketModal = document.getElementById('ticket-modal');
            const modalContent = document.getElementById('modal-content');

            // Simulação de um banco de dados em memória
            let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
            let ticketIdCounter = localStorage.getItem('ticketIdCounter') || tickets.length;

            const priorityColors = {
                'Baixa': 'bg-green-100 text-green-800',
                'Média': 'bg-yellow-100 text-yellow-800',
                'Alta': 'bg-red-100 text-red-800'
            };

            const statusColors = {
                'Aberto': 'bg-blue-100 text-blue-800',
                'Em Andamento': 'bg-purple-100 text-purple-800',
                'Fechado': 'bg-gray-200 text-gray-600'
            };

            // Função para renderizar os tickets na tela
            const renderTickets = () => {
                const openTickets = tickets.filter(t => t.status !== 'Fechado');
                const archivedTickets = tickets.filter(t => t.status === 'Fechado');

                // Limpa e renderiza tickets abertos
                openTicketList.innerHTML = '';
                if (openTickets.length === 0) {
                    openTicketList.appendChild(noOpenTicketsMessage);
                    noOpenTicketsMessage.style.display = 'block';
                } else {
                    noOpenTicketsMessage.style.display = 'none';
                    const sortedOpenTickets = [...openTickets].sort((a, b) => b.id - a.id);
                    sortedOpenTickets.forEach(ticket => {
                        const ticketElement = createTicketElement(ticket);
                        openTicketList.appendChild(ticketElement);
                    });
                }

                // Limpa e renderiza tickets arquivados
                archivedTicketList.innerHTML = '';
                if (archivedTickets.length === 0) {
                    archivedTicketList.appendChild(noArchivedTicketsMessage);
                    noArchivedTicketsMessage.style.display = 'block';
                } else {
                    noArchivedTicketsMessage.style.display = 'none';
                    const sortedArchivedTickets = [...archivedTickets].sort((a, b) => b.id - a.id);
                    sortedArchivedTickets.forEach(ticket => {
                        const ticketElement = createTicketElement(ticket, true); // O 'true' indica que é um ticket arquivado
                        archivedTicketList.appendChild(ticketElement);
                    });
                }
            };

            // Cria o elemento HTML para um ticket
            const createTicketElement = (ticket, isArchived = false) => {
                const ticketElement = document.createElement('div');
                ticketElement.className = 'border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200';
                ticketElement.dataset.id = ticket.id;

                let extraButtons = '';
                if (isArchived) {
                    extraButtons = `<button data-id="${ticket.id}" class="delete-btn bg-red-500 text-white font-bold py-1 px-2 text-sm rounded-md hover:bg-red-600 transition ml-2">Excluir</button>`;
                    ticketElement.classList.add('cursor-default');
                } else {
                    ticketElement.addEventListener('click', () => showTicketDetails(ticket.id));
                }

                ticketElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">${ticket.subject}</h3>
                            <p class="text-sm text-gray-500">Solicitante: ${ticket.name} | Depto: ${ticket.department}</p>
                        </div>
                        <div class="text-right flex items-center">
                            <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${statusColors[ticket.status]}">
                                ${ticket.status}
                            </span>
                            <span class="mt-1 text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${priorityColors[ticket.priority]}">
                                Prioridade ${ticket.priority}
                            </span>
                            ${extraButtons}
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 mt-2">Ticket #${String(ticket.id).padStart(4, '0')} - Criado em ${ticket.date}</div>
                `;

                return ticketElement;
            };

            // Event delegation para o botão de exclusão
            archivedTicketList.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const ticketId = e.target.dataset.id;
                    deleteTicket(ticketId);
                }
            });

            // Função para salvar os dados no LocalStorage
            const saveData = () => {
                localStorage.setItem('tickets', JSON.stringify(tickets));
                localStorage.setItem('ticketIdCounter', ticketIdCounter);
            };

            // Event listener para o envio do formulário
            ticketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                ticketIdCounter++;

                const newTicket = {
                    id: ticketIdCounter,
                    name: document.getElementById('requester-name').value,
                    subject: document.getElementById('ticket-subject').value,
                    department: document.getElementById('ticket-department').value,
                    priority: document.getElementById('ticket-priority').value,
                    description: document.getElementById('ticket-description').value,
                    status: 'Aberto',
                    date: new Date().toLocaleString('pt-BR')
                };

                tickets.push(newTicket);
                saveData();
                renderTickets();
                ticketForm.reset();
            });

            // Função para exibir detalhes do ticket no modal
            const showTicketDetails = (id) => {
                const ticket = tickets.find(t => t.id == id);
                if (!ticket) return;

                modalContent.innerHTML = `
                    <div class="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 class="text-2xl font-bold">Detalhes do Ticket #${String(ticket.id).padStart(4, '0')}</h2>
                        <button id="close-modal" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>
                    <div class="space-y-4">
                        <p><strong>Assunto:</strong> ${ticket.subject}</p>
                        <p><strong>Solicitante:</strong> ${ticket.name}</p>
                        <p><strong>Departamento:</strong> ${ticket.department}</p>
                        <p><strong>Criado em:</strong> ${ticket.date}</p>
                        <div class="flex flex-wrap gap-4 items-center">
                            <p><strong>Prioridade:</strong> <span class="text-sm font-semibold py-1 px-2 rounded-full ${priorityColors[ticket.priority]}">${ticket.priority}</span></p>
                            <p><strong>Status:</strong> <span class="text-sm font-semibold py-1 px-2 rounded-full ${statusColors[ticket.status]}">${ticket.status}</span></p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-md">
                            <p class="font-semibold">Descrição:</p>
                            <p class="whitespace-pre-wrap">${ticket.description}</p>
                        </div>
                        <div class="flex gap-4 justify-end pt-4 border-t mt-4">
                            ${ticket.status === 'Aberto' ? `<button data-id="${ticket.id}" data-status="Em Andamento" class="status-btn bg-purple-500 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-600 transition">Iniciar Atendimento</button>` : ''}
                            ${ticket.status !== 'Fechado' ? `<button data-id="${ticket.id}" data-status="Fechado" class="status-btn bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition">Fechar Ticket</button>` : ''}
                        </div>
                    </div>
                `;
                ticketModal.classList.remove('hidden');
                ticketModal.classList.add('flex');

                document.getElementById('close-modal').addEventListener('click', () => {
                    ticketModal.classList.add('hidden');
                    ticketModal.classList.remove('flex');
                });
                
                document.querySelectorAll('.status-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const ticketId = e.target.dataset.id;
                        const newStatus = e.target.dataset.status;
                        updateTicketStatus(ticketId, newStatus);
                    });
                });
            };
            
            // Função para atualizar o status do ticket
            const updateTicketStatus = (id, newStatus) => {
                const ticketIndex = tickets.findIndex(t => t.id == id);
                if (ticketIndex !== -1) {
                    tickets[ticketIndex].status = newStatus;
                    saveData();
                    renderTickets();
                    ticketModal.classList.add('hidden');
                    ticketModal.classList.remove('flex');
                }
            };

            // Função para excluir um ticket
            const deleteTicket = (id) => {
                const updatedTickets = tickets.filter(t => t.id != id);
                tickets = updatedTickets;
                saveData();
                renderTickets();
            };
            
            // Fecha o modal se clicar fora do conteúdo
            ticketModal.addEventListener('click', (e) => {
                if(e.target === ticketModal) {
                    ticketModal.classList.add('hidden');
                    ticketModal.classList.remove('flex');
                }
            });

            // Renderização inicial
            renderTickets();
        });