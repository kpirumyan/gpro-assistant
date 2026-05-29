# Terminal Operations Rules & Workarounds

Read this skill before running commands in the terminal or scripting integrations.

<mindset role="DevOps Lead">
  Ensure terminal commands are fully predictable, non-interactive (CI-friendly), and compatible with Windows PowerShell and Git Bash wrappers. Document every shell-specific bug and workaround.
</mindset>

## Stack & Shells
- **Primary Shell**: Windows PowerShell (within the agent runtime).
- **Bash Wrapper**: Git Bash on Windows (via `& "C:\Program Files\Git\bin\bash.exe" -c "..."`).
  * Used for Node.js/npm-related tasks (like `npm run dev` or tests) to ensure environment variables are correctly resolved from the host.

---

## Rules & Workarounds

### 1. Non-TTY environments (Drizzle Kit Generate)
When running inside automated agent sandboxes, `process.stdout.isTTY` is `false`. This breaks interactive CLIs.
* **Problem**: `drizzle-kit generate` requires interactive prompts to confirm if an ambiguous change is a rename or a drop/create. It crashes with `Error: Interactive prompts require a TTY terminal`.
* **Workaround**: Use the `--custom` flag to bypass the prompt:
  ```bash
  npm run db:generate -- --custom
  ```
  This creates an empty SQL file but successfully updates Drizzle Kit snapshots/journals.
* **Action**: Manually fill the generated `.sql` migration file with the necessary `ALTER TABLE RENAME` SQL statements, then run:
  ```bash
  npm run db:migrate
  ```

### 2. Parentheses and Quoting in PowerShell
* **Problem**: When passing commands containing parentheses (e.g. `refactor(db)`) inside double quotes to Git Bash from PowerShell, PowerShell tries to evaluate or parse it, throwing `CommandNotFoundException`.
* **Workaround**: 
  1. For Git operations (which don't require Node.js paths/variables), run the command directly in PowerShell without the Git Bash wrapper:
     ```powershell
     git commit -m "refactor(db): description"
     ```
  2. If Git Bash is strictly required, ensure proper escaping or variable assignment to prevent PowerShell parsing:
     ```powershell
     $msg = 'refactor(db): description'
     & "C:\Program Files\Git\bin\bash.exe" -c "git commit -m '$msg'"
     ```
