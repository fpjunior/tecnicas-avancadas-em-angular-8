import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmesService } from 'src/app/core/filmes.service';
import { AlertaComponent } from 'src/app/shared/components/alerta/alerta.component';
import { ValidarCamposService } from 'src/app/shared/components/campos/validar-campos.service';
import { Alerta } from 'src/app/shared/models/alerta';
import { Filme } from 'src/app/shared/models/filme';

@Component({
  selector: 'dio-cadastro-filmes',
  templateUrl: './cadastro-filmes.component.html',
  styleUrls: ['./cadastro-filmes.component.scss']
})
export class CadastroFilmesComponent implements OnInit {

  cadastro: FormGroup;
  generos: Array<string>;
  msgErrorsTitulo: string = 'Preenchimento Obrigatório'
  msgErrorsUrlFoto: string;
  msgErrorsUrlIMDb: string;
  msgErrorsDtNascimento: string;
  msgErrorsGenero: string;
  id: number;

  constructor(public validacao: ValidarCamposService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private filmesService: FilmesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  get f() {
    return this.cadastro.controls;
  }


  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    if (this.id) {
      this.filmesService.visualizar(this.id).subscribe((filme: Filme) => {
        this.criarFormulario(filme)
      })
    } else {
      this.criarFilmeEmBranco();
    }

    this.generos = ["Ação", "Romance", "Aventura", "Suspense", "Comédia", "Terror", "Drama"];

  }

  private criarFilmeEmBranco(): Filme {
    return {
      id: null,
      titulo: null,
      urlFoto: null,
      dtLancamento: null,
      descricao: null,
      nota: null,
      urlIMDb: null,
      genero: null
    } as Filme;
  }

  private criarFormulario(filme: Filme): void {

    this.cadastro = this.fb.group({
      titulo: [filme.titulo, [Validators.required, Validators.minLength(2), Validators.maxLength(256)]],
      urlFoto: [filme.urlFoto, [Validators.minLength(10)]],
      dtLancamento: [filme.dtLancamento, [Validators.required]],
      descricao: [filme.descricao],
      nota: [filme.nota, [Validators.required, Validators.min(0), Validators.max(10)]],
      urlIMDb: [filme.urlIMDb, [Validators.minLength(10)]],
      genero: [filme.genero, [Validators.required]]
    });
  }

  submit(): void {
    this.cadastro.markAllAsTouched();
    if (this.cadastro.invalid) {
      const config = {
        data: {
          descricao: 'erro ao salvar',
          titulo: 'Erro',
          btnSucesso: 'Ir para a listagem',
          btnCancelar: 'Cadastrar um novo filme',
          corBtnSucesso: 'accent',
          corBtnCancelar: 'warn',
          possuirBtnFechar: false,
        } as Alerta
      }
      const dialogRef = this.dialog.open(AlertaComponent, config);
      return
    }
    const filme = this.cadastro.getRawValue() as Filme;

    if (this.id) {
      filme.id = this.id
      this.editar(filme);
    } else {
      this.salvar(filme);
    }
  }

  private salvar(filme: Filme): void {
    this.filmesService.salvar(filme).subscribe(() => {
      const config = {
        data: {
          btnSucesso: 'Ir para a listagem',
          btnCancelar: 'Cadastrar um novo filme',
          corBtnSucesso: 'accent',
          corBtnCancelar: 'warn',
          possuirBtnFechar: true,
        } as Alerta
      }
      const dialogRef = this.dialog.open(AlertaComponent, config);
      dialogRef.afterClosed().subscribe((opcao: boolean) => {
        if (opcao) {
          this.router.navigateByUrl('filmes')
        } else {
          this.reset()
        }
      })
    },
      () => {
        const config = {
          data: {
            titulo: 'Erro ao salvar o registro!',
            descricao: 'Não conseguimos salvar seu registro, favor tentar novamente mais tarde',
            corBtnSucesso: 'accent',
            btnSucesso: 'Fechar'
          } as Alerta
        }
        this.dialog.open(AlertaComponent, config);
      },
    )
  }

  private editar(filme: Filme): void {
    this.filmesService.editar(filme).subscribe(() => {
      const config = {
        data: {
          descricao: 'Seu registro foi atualizado com sucesso!',
          btnSucesso: 'Ir para a listagem',
          corBtnSucesso: 'warn'
        } as Alerta
      }
      const dialogRef = this.dialog.open(AlertaComponent, config);
      dialogRef.afterClosed().subscribe(() => this.router.navigateByUrl('filmes'));
    },
      () => {
        const config = {
          data: {
            titulo: 'Erro ao editar o registro!',
            descricao: 'Não conseguimos editar seu registro, favor tentar novamente mais tarde',
            corBtnSucesso: 'warn',
            btnSucesso: 'Fechar'
          } as Alerta
        }
        this.dialog.open(AlertaComponent, config);
      },
    )
  }

  reset(): void {
    this.cadastro.reset();
  }

}
