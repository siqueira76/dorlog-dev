# Configuração das Regras do Firestore

Para resolver os erros de "permission-denied", você precisa configurar as regras de segurança do Firestore no Firebase Console:

## 1. Acesse o Firebase Console
1. Vá para https://console.firebase.google.com/
2. Selecione seu projeto
3. Clique em "Firestore Database"
4. Vá para a aba "Regras" (Rules)

## 2. Configure as Regras de Segurança

Substitua as regras existentes por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra para a coleção usuarios
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regra adicional para permitir que usuários autenticados criem documentos
    match /usuarios/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 3. Publique as Regras
Clique em "Publicar" para ativar as novas regras.

## 4. Verificação
- Certifique-se de que a Authentication está habilitada no Firebase
- Verifique se o método de login do Google está ativo
- Confirme que seu domínio está na lista de domínios autorizados

## Problemas Comuns
- **Permission denied**: Verifique se as regras estão publicadas
- **Auth não funciona**: Confirme as configurações de Authentication
- **Domínio não autorizado**: Adicione o domínio do Replit nos domínios autorizados