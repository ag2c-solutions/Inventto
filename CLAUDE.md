# Otimização de Contexto e Tokens (RTK)
Neste projeto, utilize ESTRITAMENTE a ferramenta de linha de comando RTK para operações de arquivo, busca e execução de comandos, garantindo a economia de contexto.É TERMINANTEMENTE PROIBIDO utilizar as ferramentas nativas Read, Grep, Glob ou Bash. Resolva o binário nesta ordem:
1. `rtk` no PATH do shell;
2. se não estiver no PATH, use o caminho absoluto `C:\Users\Rafael\rtk\rtk.exe`;
3. só caia para as ferramentas nativas se nenhum dos dois existir — e avise.

## Commands:

### Files
```bash
rtk ls .                        # Token-optimized directory tree
rtk read file.rs                # Smart file reading
rtk read file.rs -l aggressive  # Signatures only (strips bodies)
rtk smart file.rs               # 2-line heuristic code summary
rtk find "*.rs" .               # Compact find results
rtk grep "pattern" .            # Grouped search results
rtk diff file1 file2            # Condensed diff (exit 1 if files differ)
```
### Git
```bash
rtk git status                  # Compact status
rtk git log -n 10               # One-line commits
rtk git diff                    # Condensed diff
rtk git add                     # -> "ok"
rtk git commit -m "msg"         # -> "ok abc1234"
rtk git push                    # -> "ok main"
rtk git pull                    # -> "ok 3 files +10 -2"
```
### GitHub CLI

```bash
rtk gh pr list                   # Compact PR list
rtk gh pr view N                 # PR details + check status
rtk gh issue list                # Issues list
rtk gh run list                  # Workflow run history
```

### Test, Lint & Others
```bash
rtk vitest                       # Compact test output
rtk tsc                          # TypeScript errors grouped by file
rtk lint                         # Grouped lint errors
rtk pnpm list                    # Compact dependency tree
rtk pnpm install                 # Install dependencies
rtk pnpm clean                   # Clean cache
rtk pnpm build                   # Build project
``` 