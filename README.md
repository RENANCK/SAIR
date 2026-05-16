# TIMER

Aplicativo estático em HTML/CSS/JS com cronômetro oculto para estímulos aleatórios e foco contínuo.

## Funcionalidades

- Tela inicial para escolha de modo: **Convencional** ou **Pomodoro**.
- No modo Convencional, definição de uma faixa de tempo escolhendo o **tempo mínimo** e o **tempo máximo** (em minutos).
- Campo opcional para adicionar **intervalos personalizados** fixos (em minutos).
- Ciclos aleatórios ocultos calculados a partir da faixa entre o mínimo e o máximo escolhidos.
- Quando há intervalos personalizados, o sorteio usa apenas os intervalos cadastrados.
- Modo **Pomodoro** com tempo de foco oculto e cronômetro de descanso visível.
- Ajuste manual dos tempos (mínimo e máximo) diretamente no painel principal, sem precisar reiniciar a aplicação.
- Exibição apenas de mensagens de status (sem revelar o tempo exato do ciclo atual de foco).
- Alarme em loop ao final do ciclo usando `assets/alarme.m4a`.
- Botão **Parar música e continuar** para iniciar um novo ciclo oculto.
- Botões para **Desativar** (interromper timer e alarme) ou **Mudar Tempos** (voltar para a tela de configuração).

## Arquivos

- `index.html`
- `style.css`
- `script.js`
- `assets/alarme.m4a` (adicione manualmente este arquivo local)

## Como usar

1. Coloque seu áudio de alarme em `assets/alarme.m4a`.
2. Abra `index.html` no navegador.
3. Escolha o modo desejado: Convencional ou Pomodoro.
4. (Modo Convencional) Informe o **tempo mínimo** e o **tempo máximo** desejados.
5. Clique em **Começar** e depois em **Ativar** no painel principal para iniciar a contagem oculta.
