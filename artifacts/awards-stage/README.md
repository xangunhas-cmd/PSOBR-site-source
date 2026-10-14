# Palco de premiação PSOBR

Reconstrução geométrica das oito capturas fornecidas em 21/09/2026. Não é extração do jogo nem fotogrametria: as medidas e superfícies pouco visíveis são estimadas pelas referências. O palco usa azul-marinho, piso azul, borda prateada e taça dourada. O estádio e a interface do jogo não fazem parte deste objeto.

## Arquivos prontos

- `../../public/models/psobr-awards-stage.glb`: conjunto completo, com materiais PBR e textos em geometria. Sem dependências de texturas externas.
- `../../public/models/psobr-trophy.glb`: taça independente, incluindo sua base preta, sem o pedestal alto.
- `../../public/models/psobr-awards-stage.json`: medidas, tamanho dos arquivos e contagem de triângulos.
- `../../lib/awards-stage-model.js`: fonte editável e reutilizável com Three.js.

O modelo completo mede aproximadamente 18,44 × 5,64 × 7,08 unidades. Convenção: metros estimados, eixo vertical +Y, frente +Z e piso em Y=0. Origem no centro do palco. Os grupos `Platform`, `Side_Stairs`, `Ceremony_Arch`, `Team_Banner` e `Trophy_Display` podem ser movidos individualmente. As letras não têm animações nem lógica vinculada à competição.

## Prévia local

Na raiz do projeto, execute `python3 -m http.server 8765 --bind 127.0.0.1` e abra `http://127.0.0.1:8765/artifacts/awards-stage/`. A prévia permite girar, aproximar, alternar vistas e experimentar a paleta verde do PSOBR. A alternância afeta apenas a prévia; o GLB continua com a paleta original das fotos.

## Uso futuro no site

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const { scene: stage } = await new GLTFLoader().loadAsync('/models/psobr-awards-stage.glb');
scene.add(stage);
// Use iluminação ambiente/environment map para os reflexos do dourado.
stage.traverse(object => {
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});
```

Para gerar nomes e cores diferentes, edite as opções de `createAwardsStage` em `scripts/export-awards-stage.mjs` e execute `node scripts/export-awards-stage.mjs`. A função aceita `teamName`, `competitionName`, `font` (Font de Three.js) e `colors` com `stage`, `structure`, `edge`, `gold`, `pedestal`, `lettering`. Textos longos são reduzidos para caber. Ao criar o modelo diretamente, forneça `font` para incluir a tipografia. A exportação usa Droid Sans Bold, com suporte a acentos; a licença está em `node_modules/three/examples/fonts/droid/NOTICE`.

Preparado para uso futuro: nenhuma página, navegação ou cena atual do site foi alterada.

## Comemoração do título

O botão **Celebrar título** da prévia dispara uma sequência de dez segundos com fogos 3D, canhões laterais de confetes verdes/dourados, iluminação noturna gradual e mensagem de campeão. O botão volta a ficar disponível ao fim da sequência. A preferência do sistema por movimento reduzido é respeitada com uma mensagem estática.

O efeito reutilizável está em `lib/title-celebration.js`: crie com `createTitleCelebration(scene)`, dispare `start()` e chame `update(deltaSeconds)` em cada quadro. `update` retorna a intensidade de 0 a 1 para sincronizar a iluminação. Chame `dispose()` ao desmontar a cena. A animação usa partículas calculadas em tempo real e é entregue como código, separadamente dos arquivos GLB.
