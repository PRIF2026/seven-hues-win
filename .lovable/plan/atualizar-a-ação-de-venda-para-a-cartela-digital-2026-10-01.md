# Atualizar a ação de venda para a cartela digital

## O que será alterado
- Renomear o botão para **“Registrar venda, lançar selo e atualizar App”**.
- Manter a gravação atômica já existente: a venda registra o selo e atualiza os pontos do associado no banco central.
- Ajustar a confirmação após o registro para informar que a cartela digital foi atualizada.

## Integração com o futuro app
- O futuro app do associado deverá consultar os pontos e selos pelo cadastro vinculado ao telefone do cliente.
- Não será criada agora uma integração externa ou notificação para um app que ainda não existe; o saldo central ficará atualizado e pronto para ser consumido por ele.

## Validação
- Confirmar que o botão continua bloqueado sem cliente, loja ou produto.
- Confirmar que o registro de venda continua atualizando a lista e o saldo sem alterar as regras de pontuação.
