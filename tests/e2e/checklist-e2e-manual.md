# Checklist de ejecución manual

Ejecute en este orden (cada paso es un **Send** individual). Marque la casilla y anote el resultado en `registro-ejecucion-manual.md`.
Antes de cada petición protegida, compruebe en la pestaña *Authorization* qué token usa. Si un token expira (15 min), repita el login del actor.

## Preparación

- [ ] **1. PREP-01** — GET /api/venues/active · actor **ANON** · esperado **200**

## Flujo A — Descubrimiento público

- [ ] **2. E2E-VEN-02** — GET /api/venues/active · actor **ANON** · esperado **200**
  - 📋 Copiar: Confirmar que venueActiveCode (E2E-VEN-01) aparece en la lista.
- [ ] **3. E2E-VEN-01** — GET /api/venues/{…} · actor **ANON** · esperado **200**
- [ ] **4. E2E-VEN-01N** — GET /api/venues/NO-EXISTE-{…} · actor **ANON** · esperado **404**
- [ ] **5. E2E-ART-03** — GET /api/artists/active · actor **ANON** · esperado **200**
  - 📋 Copiar: Copiar el id de 'Solar Beat' a la variable artistId.
- [ ] **6. E2E-ART-01** — GET /api/artists/{…} · actor **ANON** · esperado **200**
  - Precondición: Variable artistId copiada desde E2E-ART-03.
- [ ] **7. E2E-ART-01N** — GET /api/artists/999999999 · actor **ANON** · esperado **404**
- [ ] **8. E2E-ART-02** — GET /api/artists/by-stage-name?stageName=… · actor **ANON** · esperado **200**
- [ ] **9. E2E-ART-02N** — GET /api/artists/by-stage-name?stageName=… · actor **ANON** · esperado **404**
- [ ] **10. E2E-EVT-03a** — GET /api/events/published · actor **ANON** · esperado **200**
- [ ] **11. E2E-EVT-02** — GET /api/events/{…} · actor **ANON** · esperado **200**
- [ ] **12. TC-SEC-004** — GET /api/events/{…} · actor **ANON** · esperado **404**
- [ ] **13. E2E-EVT-02N** — GET /api/events/NO-EXISTE-{…} · actor **ANON** · esperado **404**
- [ ] **14. E2E-EVT-06** — GET /api/events/by-artist?stageName=… · actor **ANON** · esperado **200**

## Flujo B — Registro y JWT

- [ ] **15. E2E-USR-01A** — POST /api/users · actor **ANON** · esperado **201**
  - Precondición: userAUsername, userAEmail y userAPassword definidos (contraseña de 12 a 72 caracteres).
- [ ] **16. E2E-USR-01B** — POST /api/users · actor **ANON** · esperado **201**
  - Precondición: Variables de USER_B definidas.
- [ ] **17. TC-SEC-016a** — POST /api/users · actor **ANON** · esperado **201**
- [ ] **18. TC-BIZ-006a** — POST /api/users · actor **ANON** · esperado **409**
- [ ] **19. TC-BIZ-006b** — POST /api/users · actor **ANON** · esperado **409**
- [ ] **20. E2E-AUTH-01** — POST /api/auth/login · actor **ANON** · esperado **200**
  - 📋 Copiar: Copiar accessToken a userAToken (valor local/Current value).
- [ ] **21. TC-AUTH-003** — POST /api/auth/login · actor **ANON** · esperado **200**
- [ ] **22. E2E-AUTH-01B** — POST /api/auth/login · actor **ANON** · esperado **200**
  - 📋 Copiar: Copiar accessToken a userBToken.
- [ ] **23. E2E-AUTH-01S** — POST /api/auth/login · actor **ANON** · esperado **200**
  - 📋 Copiar: Copiar accessToken a staffToken.
  - Precondición: Seed E2E aplicado (usuario e2e_staff).
- [ ] **24. E2E-AUTH-01M** — POST /api/auth/login · actor **ANON** · esperado **200**
  - 📋 Copiar: Copiar accessToken a adminToken.
  - Precondición: Seed E2E aplicado (usuario e2e_admin).
- [ ] **25. E2E-AUTH-01C** — POST /api/auth/login · actor **ANON** · esperado **200**
  - 📋 Copiar: Copiar accessToken a userCToken.
- [ ] **26. E2E-AUTH-02** — GET /api/auth/me · actor **USER_A** · esperado **200**
- [ ] **27. E2E-AUTH-02B** — GET /api/auth/me · actor **USER_B** · esperado **200**
- [ ] **28. E2E-AUTH-02S** — GET /api/auth/me · actor **STAFF** · esperado **200**
- [ ] **29. E2E-AUTH-02M** — GET /api/auth/me · actor **ADMIN** · esperado **200**
- [ ] **30. TC-SEC-016b** — GET /api/auth/me · actor **USER_C** · esperado **200**
- [ ] **31. TC-AUTH-004** — POST /api/auth/login · actor **ANON** · esperado **401**
- [ ] **32. TC-AUTH-005** — POST /api/auth/login · actor **ANON** · esperado **401**

## Flujo B (cont.) — JWT inválidos

- [ ] **33. TC-AUTH-007** — GET /api/auth/me · actor **ANON** · esperado **401**
- [ ] **34. TC-AUTH-008a** — GET /api/auth/me · actor **ANON** · esperado **401**
- [ ] **35. TC-AUTH-008b** — GET /api/auth/me · actor **ANON** · esperado **401**
- [ ] **36. TC-AUTH-009** — GET /api/auth/me · actor **ANON** · esperado **401**
  - Precondición: userAToken válido copiado.
- [ ] **37. TC-AUTH-011a** — GET /api/auth/me · actor **ANON** · esperado **401**
  - Precondición: foreignKeyToken tomado de fixtures/README.md (firmado con una clave descartada).
- [ ] **38. TC-AUTH-011b** — GET /api/auth/me · actor **ANON** · esperado **401**
  - Precondición: unsignedToken tomado de fixtures/README.md.
- [ ] **39. TC-AUTH-012** — GET /api/auth/me?access_token=… · actor **ANON** · esperado **401**
  - Precondición: userAToken válido copiado.
- [ ] **40. TC-AUTH-015** — GET /api/events/published · actor **ANON** · esperado **401**

## Flujo B (cont.) — Usuarios y propiedad

- [ ] **41. E2E-USR-02** — GET /api/users/by-email?email=… · actor **USER_A** · esperado **200**
- [ ] **42. E2E-USR-02M** — GET /api/users/by-email?email=… · actor **ADMIN** · esperado **200**
- [ ] **43. E2E-USR-03** — GET /api/users/{…} · actor **USER_A** · esperado **200**
- [ ] **44. E2E-USR-03M** — GET /api/users/{…} · actor **ADMIN** · esperado **200**
- [ ] **45. TC-SEC-006** — GET /api/users/by-email?email=… · actor **USER_B** · esperado **403**
- [ ] **46. TC-SEC-007** — GET /api/users/{…} · actor **USER_B** · esperado **403**
- [ ] **47. TC-SEC-007S** — GET /api/users/by-email?email=… · actor **STAFF** · esperado **403**
- [ ] **48. TC-SEC-007N** — GET /api/users/by-email?email=… · actor **ANON** · esperado **401**
- [ ] **49. TC-SEC-007U** — GET /api/users/{…} · actor **ANON** · esperado **401**
- [ ] **50. TC-SEC-007X** — GET /api/users/no-existe-{…} · actor **USER_A** · esperado **403**
- [ ] **51. E2E-USR-03N** — GET /api/users/no-existe-{…} · actor **ADMIN** · esperado **404**

## Flujo C — Catálogo (ADMIN)

- [ ] **52. TC-SEC-001a** — POST /api/events · actor **ANON** · esperado **401**
- [ ] **53. TC-SEC-001b** — POST /api/events · actor **USER_A** · esperado **403**
- [ ] **54. TC-SEC-001c** — POST /api/events · actor **STAFF** · esperado **403**
- [ ] **55. TC-SEC-001d** — GET /api/events/{…}-SEC · actor **ADMIN** · esperado **404**
- [ ] **56. TC-SEC-002a** — PATCH /api/events/{…}/publish · actor **ANON** · esperado **401**
- [ ] **57. TC-SEC-002b** — PATCH /api/events/{…}/publish · actor **USER_A** · esperado **403**
- [ ] **58. TC-SEC-002c** — PATCH /api/events/{…}/publish · actor **STAFF** · esperado **403**
- [ ] **59. TC-SEC-002d** — GET /api/events/{…} · actor **ADMIN** · esperado **200**
- [ ] **60. TC-SEC-003a** — POST /api/events/{…}/artists/{…} · actor **ANON** · esperado **401**
- [ ] **61. TC-SEC-003b** — POST /api/events/{…}/artists/{…} · actor **USER_A** · esperado **403**
- [ ] **62. TC-SEC-003c** — POST /api/events/{…}/artists/{…} · actor **STAFF** · esperado **403**
- [ ] **63. TC-SEC-003d** — GET /api/events/{…} · actor **ADMIN** · esperado **200**
- [ ] **64. E2E-EVT-01** — POST /api/events · actor **ADMIN** · esperado **201**
  - Precondición: adminToken válido. newEventCode definido. eventFutureDate futura y venueActiveCode existente.
- [ ] **65. E2E-EVT-02A** — GET /api/events/{…} · actor **ADMIN** · esperado **200**
- [ ] **66. TC-SEC-015a** — GET /api/events/{…} · actor **ADMIN** · esperado **200**
- [ ] **67. TC-SEC-015b** — GET /api/events/{…} · actor **STAFF** · esperado **200**
- [ ] **68. E2E-EVT-03b** — GET /api/events/published · actor **ANON** · esperado **200**
- [ ] **69. E2E-EVT-05** — POST /api/events/{…}/artists/{…} · actor **ADMIN** · esperado **200**
- [ ] **70. E2E-EVT-05V** — GET /api/events/{…} · actor **ADMIN** · esperado **200**
- [ ] **71. E2E-EVT-05D** — POST /api/events/{…}/artists/{…} · actor **ADMIN** · esperado **409**
- [ ] **72. E2E-EVT-05N** — POST /api/events/{…}/artists/999999999 · actor **ADMIN** · esperado **404**
- [ ] **73. E2E-EVT-05M** — POST /api/events/NO-EXISTE-{…}/artists/{…} · actor **ADMIN** · esperado **404**
- [ ] **74. E2E-EVT-04** — PATCH /api/events/{…}/publish · actor **ADMIN** · esperado **200**
- [ ] **75. E2E-EVT-04V** — GET /api/events/{…} · actor **ANON** · esperado **200**
- [ ] **76. E2E-EVT-04D** — PATCH /api/events/{…}/publish · actor **ADMIN** · esperado **409**
- [ ] **77. E2E-EVT-04N** — PATCH /api/events/NO-EXISTE-{…}/publish · actor **ADMIN** · esperado **404**
- [ ] **78. E2E-EVT-03c** — GET /api/events/published · actor **ANON** · esperado **200**
- [ ] **79. E2E-EVT-06b** — GET /api/events/by-artist?stageName=… · actor **ANON** · esperado **200**
- [ ] **80. E2E-EVT-06c** — GET /api/events/by-artist?stageName=… · actor **ADMIN** · esperado **200**
- [ ] **81. E2E-EVT-01D** — POST /api/events · actor **ADMIN** · esperado **409**
- [ ] **82. E2E-EVT-01V** — POST /api/events · actor **ADMIN** · esperado **404**
- [ ] **83. E2E-EVT-01P** — POST /api/events · actor **ADMIN** · esperado **409**
- [ ] **84. E2E-EVT-01I** — POST /api/events · actor **ADMIN** · esperado **409**
  - Precondición: Seed con el venue E2E-VEN-INACTIVE.

## Flujo D — Compra, propiedad, cancelación y uso

- [ ] **85. TC-BIZ-007a** — POST /api/tickets · actor **USER_A** · esperado **201**
  - Precondición: userAToken válido; publishedEventCode con fecha futura.
- [ ] **86. E2E-TKT-03a** — GET /api/tickets/by-user?email=… · actor **USER_A** · esperado **200**
  - 📋 Copiar: Copiar ticketCode a ticketCancelableCode (T1).
- [ ] **87. TC-BIZ-007b** — POST /api/tickets · actor **USER_A** · esperado **201**
- [ ] **88. E2E-TKT-03b** — GET /api/tickets/by-user?email=… · actor **USER_A** · esperado **200**
  - 📋 Copiar: Copiar el ticketCode nuevo a ticketUsableCode (T2).
- [ ] **89. TC-BIZ-007c** — POST /api/tickets · actor **USER_A** · esperado **201**
- [ ] **90. E2E-TKT-03c** — GET /api/tickets/by-user?email=… · actor **USER_A** · esperado **200**
  - 📋 Copiar: Copiar el ticketCode nuevo a ticketIdorCode (T3, solo para pruebas IDOR; no mutarlo).
- [ ] **91. E2E-TKT-02** — GET /api/tickets/{…} · actor **USER_A** · esperado **200**
- [ ] **92. E2E-TKT-02S** — GET /api/tickets/{…} · actor **STAFF** · esperado **200**
- [ ] **93. E2E-TKT-02M** — GET /api/tickets/{…} · actor **ADMIN** · esperado **200**
- [ ] **94. E2E-TKT-03M** — GET /api/tickets/by-user?email=… · actor **ADMIN** · esperado **200**
- [ ] **95. E2E-TKT-04** — GET /api/events/{…}/tickets/paid · actor **STAFF** · esperado **200**
- [ ] **96. E2E-TKT-04M** — GET /api/events/{…}/tickets/paid · actor **ADMIN** · esperado **200**
- [ ] **97. TC-SEC-008a** — POST /api/tickets · actor **USER_A** · esperado **403**
- [ ] **98. TC-SEC-008b** — GET /api/tickets/by-user?email=… · actor **USER_B** · esperado **200**
  - Precondición: Ejecutar ANTES de que USER_B compre (E2E-TKT-01B).
- [ ] **99. TC-SEC-009** — GET /api/tickets/{…} · actor **USER_B** · esperado **403**
- [ ] **100. TC-SEC-010** — GET /api/tickets/by-user?email=… · actor **USER_B** · esperado **403**
- [ ] **101. TC-SEC-011a** — PATCH /api/tickets/{…}/cancel · actor **USER_B** · esperado **403**
- [ ] **102. TC-SEC-012a** — PATCH /api/tickets/{…}/use · actor **USER_B** · esperado **403**
- [ ] **103. TC-SEC-011b** — PATCH /api/tickets/{…}/cancel · actor **STAFF** · esperado **403**
- [ ] **104. TC-SEC-012b** — PATCH /api/tickets/{…}/use · actor **USER_A** · esperado **403**
- [ ] **105. TC-SEC-011c** — GET /api/tickets/{…} · actor **USER_A** · esperado **200**
- [ ] **106. TC-SEC-013** — GET /api/events/{…}/tickets/paid · actor **USER_A** · esperado **403**
- [ ] **107. TC-SEC-013N** — GET /api/events/{…}/tickets/paid · actor **ANON** · esperado **401**
- [ ] **108. TC-SEC-009N** — GET /api/tickets/{…} · actor **ANON** · esperado **401**
- [ ] **109. TC-SEC-008N** — POST /api/tickets · actor **ANON** · esperado **401**
- [ ] **110. TC-SEC-010N** — GET /api/tickets/by-user?email=… · actor **ANON** · esperado **401**
- [ ] **111. TC-SEC-011N** — PATCH /api/tickets/{…}/cancel · actor **ANON** · esperado **401**
- [ ] **112. TC-SEC-012N** — PATCH /api/tickets/{…}/use · actor **ANON** · esperado **401**
- [ ] **113. TC-SEC-008S** — POST /api/tickets · actor **STAFF** · esperado **403**
- [ ] **114. TC-SEC-008M** — POST /api/tickets · actor **ADMIN** · esperado **403**
- [ ] **115. E2E-TKT-01B** — POST /api/tickets · actor **USER_B** · esperado **201**
- [ ] **116. E2E-TKT-03d** — GET /api/tickets/by-user?email=… · actor **USER_B** · esperado **200**
  - 📋 Copiar: Copiar ticketCode a ticketBCode.
- [ ] **117. TC-SEC-009B** — GET /api/tickets/{…} · actor **USER_A** · esperado **403**
- [ ] **118. E2E-TKT-05** — PATCH /api/tickets/{…}/cancel · actor **USER_A** · esperado **200**
- [ ] **119. TC-BIZ-010V** — GET /api/tickets/{…} · actor **USER_A** · esperado **200**
- [ ] **120. TC-BIZ-011** — PATCH /api/tickets/{…}/cancel · actor **USER_A** · esperado **409**
  - ⚠ HALLAZGO ANTICIPADO por lectura del código: TicketServiceImpl.cancel solo rechaza tickets USED; un ticket CANCELLED se acepta de nuevo y devolverá 200. Si ocurre, registrar FAIL y describirlo como defecto de la Fase 2.
- [ ] **121. TC-BIZ-012a** — PATCH /api/tickets/{…}/use · actor **STAFF** · esperado **409**
- [ ] **122. E2E-TKT-06** — PATCH /api/tickets/{…}/use · actor **STAFF** · esperado **200**
- [ ] **123. TC-BIZ-012V** — GET /api/tickets/{…} · actor **STAFF** · esperado **200**
- [ ] **124. TC-BIZ-013** — PATCH /api/tickets/{…}/use · actor **STAFF** · esperado **409**
- [ ] **125. E2E-TKT-05U** — PATCH /api/tickets/{…}/cancel · actor **USER_A** · esperado **409**
- [ ] **126. TC-BIZ-009b** — GET /api/events/{…}/tickets/paid · actor **STAFF** · esperado **200**
- [ ] **127. E2E-TKT-05M** — PATCH /api/tickets/{…}/cancel · actor **ADMIN** · esperado **200**
- [ ] **128. E2E-TKT-05V** — GET /api/tickets/{…} · actor **USER_B** · esperado **200**
- [ ] **129. E2E-TKT-02N** — GET /api/tickets/NOEXISTE-{…} · actor **STAFF** · esperado **404**
- [ ] **130. E2E-TKT-02X** — GET /api/tickets/NOEXISTE-{…} · actor **USER_A** · esperado **403**
- [ ] **131. E2E-TKT-06N** — PATCH /api/tickets/NOEXISTE-{…}/use · actor **STAFF** · esperado **404**
- [ ] **132. E2E-TKT-05N** — PATCH /api/tickets/NOEXISTE-{…}/cancel · actor **ADMIN** · esperado **404**

## Flujo E — Regresión de errores

- [ ] **133. TC-HTTP-01** — POST /api/users · actor **ANON** · esperado **400**
- [ ] **134. TC-HTTP-02** — POST /api/users · actor **ANON** · esperado **400**
- [ ] **135. TC-HTTP-03** — POST /api/users · actor **ANON** · esperado **400**
- [ ] **136. TC-HTTP-04** — POST /api/users · actor **ANON** · esperado **400**
- [ ] **137. TC-HTTP-05** — POST /api/auth/login · actor **ANON** · esperado **400**
- [ ] **138. TC-HTTP-06** — POST /api/events · actor **ADMIN** · esperado **400**
- [ ] **139. TC-HTTP-07** — POST /api/events · actor **ADMIN** · esperado **400**
- [ ] **140. TC-HTTP-08** — POST /api/tickets · actor **USER_A** · esperado **400**
- [ ] **141. TC-HTTP-09** — POST /api/tickets · actor **USER_A** · esperado **400**
- [ ] **142. TC-HTTP-10** — POST /api/tickets · actor **USER_A** · esperado **404**
- [ ] **143. TC-HTTP-11** — POST /api/tickets · actor **USER_A** · esperado **409**
  - Precondición: Seed con E2E-EVT-PAST.
- [ ] **144. TC-HTTP-12** — POST /api/tickets · actor **USER_A** · esperado **409**
  - ⚠ HALLAZGO ANTICIPADO por lectura del código: TicketServiceImpl.purchase solo valida que la fecha no sea pasada; no comprueba el estado PUBLISHED, el aforo ni la edad mínima. Probablemente devolverá 201. Si ocurre, registrar FAIL (defecto de la Fase 2). Los casos de aforo agotado y edad insuficiente del PRD (TC-BIZ-014) no se pueden ejecutar: esas reglas no existen en el código.
- [ ] **145. TC-HTTP-13** — POST /api/events · actor **ADMIN** · esperado **400**
  - ⚠ HALLAZGO ANTICIPADO por lectura del código: GlobalExceptionHandler no tiene un manejador para HttpMessageNotReadableException y su catch-all Exception responde 500. Si ocurre, registrar FAIL (defecto de la Fase 3).
- [ ] **146. TC-HTTP-14** — POST /api/events · actor **ADMIN** · esperado **400**
  - ⚠ Mismo hallazgo anticipado que TC-HTTP-13 (enum inválido => HttpMessageNotReadableException => 500).
- [ ] **147. TC-HTTP-15** — DELETE /api/tickets/{…} · actor **ADMIN** · esperado **405**
  - ⚠ HALLAZGO ANTICIPADO: sin manejador específico, el catch-all responde 500 en vez de 405. Informativo.

## Casos con preparación manual (JWT expirado, usuario inactivo, rol revocado)

- [ ] **148. TC-AUTH-010** — GET /api/auth/me · actor **ANON** · esperado **401**
  - Precondición: Procedimiento en tests/e2e/README.md §Token expirado: arrancar la app con access-token-ttl=PT5S, hacer login, copiar el token a expiredToken y esperar 10 segundos.
- [ ] **149. TC-AUTH-013a** — GET /api/auth/me · actor **INACTIVE_USER** · esperado **401**
  - Precondición: Procedimiento en fixtures/README.md §Desactivar usuario: login de e2e_inactive, copiar a inactiveToken, desactivar por SQL.
- [ ] **150. TC-AUTH-013b** — POST /api/auth/login · actor **ANON** · esperado **401**
  - Precondición: Usuario e2e_inactive ya desactivado por SQL.
- [ ] **151. TC-SEC-017** — GET /api/events/{…}/tickets/paid · actor **STAFF** · esperado **403**
  - Precondición: Procedimiento en fixtures/README.md §Revocar rol: staffToken válido y emitido ANTES de revocar; luego DELETE del rol por SQL.
