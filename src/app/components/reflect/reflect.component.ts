import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { ReflectService } from "../../services/reflect.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
//import { stat } from "fs";
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import {Reflection} from '../../interfaces/image-message';

@Component({
  selector: "app-reflect",
  templateUrl: "./reflect.component.html",
  styleUrls: ["./reflect.component.scss"]
})
export class ReflectComponent implements OnInit {
  public thinkForm: FormGroup;
  public thinkAnswer;
  reflectId$;
  //private source;
  public isVisible$ = true;
  chatid$: string;
  statisticsIsVisible$: boolean = false;
  statistics$: Observable<any>;
  opinionStatistics: {
    cardid: number;
    content: string;
    createdAt: number;
    type: string;
    uid: string;
    value: number;
  }[] = new Array();

  constructor(
    private afs: AngularFirestore,
    public rs: ReflectService,
    private route: ActivatedRoute,
    public auth: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.thinkAnswer = 0;
    this.thinkForm = this.formBuilder.group({
      thinkAnswer: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.shuffle(this.cards$);
    this.chatid$ = this.route.snapshot.paramMap.get("id");
   
    this.reflectId$ = this.rs.getChatReflectionId(this.chatid$);
    //STATISTICS
    this.statistics$ = this.afs
    .collection("reflections", ref => ref.where("chatid", "==", this.chatid$))
    .snapshotChanges()
    .pipe(
      map(actions => {
        return actions.map(a => {
          const data: Reflection = a.payload.doc.data() as Reflection;
          const dataO: Object = a.payload.doc.data();
          this.calculateAvg(data.opinions);
          //console.log("data.opinions " ,data.opinions)
          return { id: a.payload.doc.id, ...dataO };
          //
        });
      })
    );
  }
  public findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
public shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}
  public sendReflection(cardid, t, c, v) {
    //console.log(cardid);
    this.rs.sendReflection(this.rs.getReflectionId(), cardid, c, t, v);
  }
  public setSelected(reflectionId) {
    console.log("this.cards$.indexOf(reflectionId) ", this.findWithAttr(this.cards$, 'id', reflectionId));
    this.cards$[this.findWithAttr(this.cards$, 'id', reflectionId)].selected = true;
  }
  statisticsVisibility() {
    //this.statistics$ = this.rs.getOpinionStatistics(this.chatid$);
    this.statisticsIsVisible$ = !this.statisticsIsVisible$;
  }
  public calculateAvg(data) {
    this.opinionStatistics.length = 0;
    let self = this;
    for (var i = 0; i < this.cards$.length; i++) {
      let filteredOpinions = data.filter(x => x.cardid === this.cards$[i].id);
      if (filteredOpinions.length > 0) {
        let sum = 0;
        filteredOpinions.forEach(element => {
          sum += element.value;
        });
        if (sum > 0) {
          let avg = (sum / filteredOpinions.length).toFixed(2);
          filteredOpinions[0].value = avg;
        }
        this.opinionStatistics.push(filteredOpinions[0]);
        //console.log("opinionStatistics ", this.opinionStatistics);
      }
    }
  }

  public cards$ = [
    /*BE: [
      {
        id: 20,
        type: "be",
        message: "??C??mo valoras tu funci??n como ENCONTRADOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "ENCONTRADOR es la persona que encuentra los objetos del problema en la vida real.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
      /*{
        id: 21,
        type: "be",
        message: "??C??mo valoras tu funci??n como M??STER? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "M??STER es la persona que se encarga de que el grupo funcione bien: organiza el juego: anima a los dem??s, deshace conflictos, organiza el grupo, sabe c??mo decir las cosas a cada uno, etc.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
      /*{
        id: 22,
        type: "ENTENDEDOR",
        message: "??C??mo valoras tu funci??n como ENTENDEDOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "ENTENDEDOR es la persona que lee, entiende y explica el problema a los dem??s. Lee y tiene una idea clara de las cosas. ",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
      /*{
        id: 23,
        type: "be",
        message: "??C??mo valoras tu funci??n como MODELADOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "MODELADOR es la persona que hace un dibujo o una representaci??n gr??fica para que se entienda el problema y se puedan encontrar las operaciones matem??ticas necesarias para resolverlo. ",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
     /* {
        id: 24,
        type: "ESTRATEGA",
        message: "??C??mo valoras tu funci??n como ESTRATEGA? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "ESTRATEGA es la persona que piensa en qu?? es lo mejor hacer en cada momento, cu??l es la mejor estrategia para conseguir m??s puntos y que el grupo est?? bien organizado. Gestiona el tiempo.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
     /* {
        id: 25,
        type: "be",
        message: "??C??mo valoras tu funci??n como RESOLVEDOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "RESOLVEDOR es la persona que plantea la soluci??n matem??tica del problema y realiza las operaciones.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 26,
        type: "be",
        message: "??C??mo valoras tu funci??n como COMPROBADOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "COMPROBADOR es la persona que se asegura de que el problema est?? bien.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 27,
        type: "PRESENTADOR",
        message: "??C??mo valoras tu funci??n como PRESENTADOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "PRESENTADOR es la persona que escribe el problema en el papel y razona la respuesta.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 28,
        type: "be",
        message: "??C??mo valoras tu funci??n como INFORMADOR? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "INFORMADOR es la persona que busca informaci??n donde haga falta para obtener los datos necesarios; en Internet, preguntando a la gente, en los apuntes, etc.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
      /*{
        id: 29,
        type: "be",
        message: "??C??mo valoras tu funci??n como CREATIVO? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "CREATIVO es la persona que da ideas, propuestas y soluciones alternativas o que hace ver a los dem??s algo que no hab??an aptreciado.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 210,
        type: "ATENTO",
        message: "??C??mo valoras tu funci??n como ATENTO? Selecciona entre muy mal (0) y muy bien (10).",
        description:
          "ATENTO es la persona que escucha a todo el grupo y valora las aportaciones de los dem??s de forma que siempre les saca utilidad.",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },*/
      /*
    ],
    DO: [
      {
        id: 0,
        type: "",
        message: "Dale esta carta a quien est?? trabajando m??s.",
        description: "",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      
      {
        id: 1,
        type: "",
        message:
          "Dale esta carta a quien, seg??n tu criterio, est?? haciendo el mayor esfuerzo por el grupo.",
        description: "",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 2,
        type: "",
        message:
          "Dale esta carta a quien est?? m??s despitado y no est?? integrado.",
        description: "",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 3,
        type: "",
        message: "Dale esta carta a quien m??s te haya sorprendido.",
        description: "",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 4,
        type: "",
        message: "Dale esta carta a quien est?? trabajando menos.",
        description: "",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 5,
        type: "",
        message:
          "En el pr??ximo problema, escucha a la persona que menos habla.",
        description:
          "Env??ale esta carta para que sepa que alguien va a escuchar de forma constructiva lo que tenga que proponer al grupo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 6,
        type: "",
        message:
          "En el pr??ximo problema, ayuda a la persona con menos puntos como RESOLVEDOR para que ella consiga el m??ximo de puntos.",
        description: "Env??ale esta carta para que sepa que vas a hacerlo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 7,
        type: "",
        message:
          "En el pr??ximo problema, ayuda a la persona con menos puntos como MODELADOR para que ella consiga el m??ximo de puntos.",
        description: "Env??ale esta carta para que sepa que vas a hacerlo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 8,
        type: "",
        message:
          "En el pr??ximo problema, ayuda a la persona con menos puntos como ESTRATEGA para que ella consiga el m??ximo de puntos.",
        description: "Env??ale esta carta para que sepa que vas a hacerlo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 9,
        type: "",
        message:
          "En el pr??ximo problema, ayuda a la persona con menos puntos como PRESENTADOR para que ella consiga el m??ximo de puntos.",
        description: "Env??ale esta carta para que sepa que vas a hacerlo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 10,
        type: "",
        message:
          "En el pr??ximo problema, ayuda a la persona con menos puntos como ENCONTRADOR para que ella consiga el m??ximo de puntos.",
        description: "Env??ale esta carta para que sepa que vas a hacerlo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 11,
        type: "",
        message:
          "En el pr??ximo problema aseg??rate de que no perd??is demasiado tiempo.",
        description: "",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      },
      {
        id: 12,
        type: "",
        message:
          "En el pr??ximo problema, ayuda a la persona con menos puntos como INFORMADOR para que ella consiga el m??ximo de puntos.",
        description: "Env??ale esta carta para que sepa que vas a hacerlo.",
        answer: "",
        selected: false,
        color: "gold",
        icon: "construct",
        value: 0
      }
      
    ],*/
    //THINK: [
    /*
      {
        id: 0,
        type: "",
        message: "??Crees que est??is coordinados?",
        description:
          "Selecciona entre muy poco (0) y mucho (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },*/
    {
      id: 0,
      type: "think",
      message:
        "??Crees que est??is comprometidos con el grupo y con resolver muchos problemas?",
      description: "Selecciona entre muy poco (0) y mucho (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },
    {
      id: 1,
      type: "think",
      message:
        "??C??mo de bien crees que est??is trabajando? Piensa si puedes hacer algo para trabajar mejor.",
      description: "Selecciona entre muy mal (0) y muy bien (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },

    {
      id: 2,
      type: "think",
      message: "??Os est?? ayudando esta aplicaci??n?",
      description: "Selecciona entre muy poco (0) y mucho (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },

    {
      id: 3,
      type: "think",
      message:
        "??C??mo creees que est??is tomando decisiones? Piensa si puedes hacer algo para tomarlas mejor. ",
      description: "Selecciona entre muy mal (0) y muy bien (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },
    {
      id: 4,
      type: "think",
      message:
        "??Cu??nto crees que os est??is divirtiendo? Piensa si puedes hacer algo para pasarlo mejor.",
      description: "Selecciona entre muy poco (0) y mucho (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    } /*
      {
        id: 6,
        type: "",
        message:
          "??Cu??nto crees que est??s aprendiendo? Piensa si puedes hacer algo para aprender m??s.",
        description:
          "Selecciona entre muy poco (0) y mucho (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },*/,
    /*
      {
        id: 7,
        type: "",
        message: "??Consideras que esta aplicaci??n os est?? siendo ??til?",
        description:
          "Selecciona entre muy poco (0) y mucho (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },
     */
    {
      id: 5,
      type: "think",
      message:
        "??Crees que est??s escuchando y respondiendo a las ideas y propuestas de los dem??s? Piensa si pod??is hacer algo para responder y aportar de forma constructiva.",
      description: "Selecciona entre muy poco (0) y mucho (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },

    {
      id: 6,
      type: "think",
      message:
        "??Sientes un poco de presi??n sobre ti? ??O sobre alguien del grupo? Piensa si pod??is hacer algo para cambiar esa actitud.",
      description: "Selecciona entre NO, nada (0) y S??, mucho (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    } /*
      {
        id: 10,
        type: "",
        message: "Valora esta aplicaci??n, por favor.",
        description:
          "Selecciona entre muy flojita (0) y muy bien (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },*/,
    {
      id: 7,
      type: "think",
      message:
        "??Hay alguien que siempre cree que tiene raz??n y que cree que lo hace todo bien? Piensa si pod??is hacer algo para cambiar esa actitud.",
      description: "Selecciona entre 'no, nadie' (0) y 's??, est?? claro' (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },
    /*
      {
        id: 12,
        type: "",
        message:
          "??Hay alguien que siempre conf??a, cree y piensa lo mismo que dice otra persona? Piensa si pod??is hacer algo para que piense por s?? misma.",
        description:
          "Selecciona entre 'no, nadie' (0) y 's??, est?? claro' (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },*/
    {
      id: 8,
      type: "think",
      message:
        "??Crees que hay personas en tu grupo que no est??n involucradas lo suficiente? Piensa si pod??is hacer algo para que todo el mundo est?? involucrado.",
      description: "Selecciona entre 'no, nadie' (0) y 's??, est?? claro' (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },
    /*
      {
        id: 14,
        type: "",
        message: "??Crees que est??s compartiendo y aportando ideas?",
        description:
          "Selecciona entre muy poco (0) y mucho (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },*/
    /*    
      {
        id: 15,
        type: "",
        message: "??Podr??as explicar o volver a hacer por tu cuenta el ??ltimo problema que hab??is resuelto?",
        description:
          "Selecciona entre muy mal (0) y muy bien (10). As??gnate esta carta a ti mismo para obtener un punto.",
        answer: "",
        selected: false,
        color: "DeepSkyBlue",
        icon: "bulb",
        value: 0
      },*/
    {
      id: 9,
      type: "think",
      message: "??Hay alguien que hace la mayor??a del trabajo?",
      description:
        "Selecciona entre 'No, todos trabajamos por igual.' (0) y 'S??, una persona lo hace todo y los dem??s nada.' (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    },
    {
      id: 10,
      type: "think",
      message: "??Os qued??is bloqueados con frecuencia sin saber qu?? hacer?",
      description:
        "Selecciona entre 'No, siempre sabemos qu?? hacer.' (0) y 'S??, nos cuesta mucho tomar decisiones.' (10).",
      answer: "",
      selected: false,
      color: "DeepSkyBlue",
      icon: "bulb",
      value: 0
    }
    // ]
  ];
}
