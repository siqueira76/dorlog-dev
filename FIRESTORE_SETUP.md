# 🚨 CONFIGURAÇÃO URGENTE - Firestore Rules

## ❌ PROBLEMA CRÍTICO
**Os usuários não estão sendo salvos na coleção "usuarios" devido a regras restritivas no Firestore.**

**Erro atual:** `permission-denied` ao tentar acessar/criar documentos.

## 🔧 SOLUÇÃO IMEDIATA

### 1. Acesse o Console Firebase
- Vá para [Firebase Console](https://console.firebase.google.com/)
- Selecione seu projeto DorLog

### 2. Configure as Regras do Firestore
- Navegue para **Firestore Database** > **Rules**
- **SUBSTITUA** completamente as regras atuais por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRA OBRIGATÓRIA PARA COLEÇÃO USUARIOS
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. ⚠️ PUBLIQUE AS REGRAS
- Clique em **"Publish"** 
- Aguarde a confirmação

## 🧪 TESTE APÓS CONFIGURAÇÃO

1. **Registre um novo usuário**
2. **Console deve mostrar:**
   ```
   ✅ Usuário criado e verificado no Firestore
   ```
3. **Verifique no Firebase:**
   - Firestore Database > Data
   - Deve existir coleção "usuarios"
   - Documento criado com ID = Firebase Auth UID

## 📊 STATUS ATUAL

✅ Firebase Authentication - FUNCIONANDO  
✅ Chaves de API - CONFIGURADAS  
❌ **Regras do Firestore - BLOQUEANDO ACESSO**  
❌ **Salvamento de Usuários - FALHANDO**  

## 🔍 Estrutura Esperada do Documento

```json
{
  "id": "firebase_auth_uid",
  "name": "Nome do Usuário",
  "email": "usuario@email.com", 
  "provider": "email" | "google",
  "createdAt": "2025-01-06T...",
  "updatedAt": "2025-01-06T..."
}
```

## 🔍 Logs Atuais de Erro
```
❌ Erro detalhado ao acessar Firestore: {code: "permission-denied"}
Erro de permissão - verifique as regras do Firestore
```

**IMPORTANTE:** Sem a configuração correta das regras, nenhum usuário será salvo no banco de dados, mesmo com autenticação bem-sucedida.