const products = [
  { id:1, name:"Vape Pod Nova", desc:"Compacto, 400mAh, 18mg", price:4500, img:"https://cdn.shopify.com/s/files/1/0687/8307/9702/collections/lost-mary-753349.webp?v=1716082161", stock:10 },
  { id:2, name:"Vape Pro X", desc:"700mAh, refill, 3 colores", price:7800, img:"https://indyargentina.com/cdn/shop/files/lost-mary-mt-35000-sour-grape-ice-5-nicotina-7832628_1024x.webp?v=1755765891", stock:5 },
  { id:3, name:"Líquido Mango 30ml", desc:"PG/VG 50/50, 30ml", price:2200, img:"https://indyargentina.com/cdn/shop/files/lost-mary-mo-20000-pro-strawberry-ice-140451_1024x.jpg?v=1722589297", stock:20 },
  { id:4, name:"Kit Starter 2x", desc:"2 dispositivos + 1 líquido", price:12900, img:"https://indyargentina.com/cdn/shop/files/lost-mary-mt-35000-watermelon-ice-5-nicotina-3873762_1024x.webp?v=1755765890", stock:3 }
];
const cart = [];
const orders = [];
const ADMIN_PASSWORD = "1234";

function formatNum(n){return n.toLocaleString('es-AR');}

function renderProducts(){
  const grid=document.getElementById('grid');
  grid.innerHTML='';
  products.forEach(p=>{
    grid.innerHTML+=`
      <div class="card">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="meta">${p.desc}</div>
        <div class="stock">Stock: ${p.stock}</div>
        <div class="price">$${formatNum(p.price)}</div>
        <button class="btn-add" onclick="addToCart(${p.id})" ${p.stock===0?'disabled style="opacity:0.5;cursor:not-allowed;"':''}>Agregar al carrito</button>
      </div>
    `;
  });
}

function renderCartPanel(){
  const list=document.getElementById('cartListPanel');
  list.innerHTML='';
  if(cart.length===0){
    list.innerHTML='<div>Carrito vacío</div>';
    document.getElementById('totalPanel').textContent = "$0";
    return;
  }
  cart.forEach(i=>{
    list.innerHTML+=`
      <div class="cart-item">
        <img src="${i.img}" alt="${i.name}">
        <div style="flex:1">
          <div><strong>${i.name}</strong></div>
          <div>$${formatNum(i.price)} x${i.qty}</div>
        </div>
        <div class="qty">
          <button onclick="changeQty(${i.id},-1)">-</button>
          <span>${i.qty}</span>
          <button onclick="changeQty(${i.id},1)">+</button>
        </div>
      </div>
    `;
  });
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('totalPanel').textContent=`$${formatNum(total)}`;
}

function addToCart(id){
  const prod=products.find(p=>p.id===id);
  if(prod.stock<=0) return alert("Producto sin stock");
  const exist=cart.find(c=>c.id===id);
  if(exist){
    if(exist.qty<prod.stock) exist.qty++;
    else return alert("No hay más stock disponible");
  } else cart.push({...prod,qty:1});
  renderCartPanel(); renderProducts();
}

function changeQty(id,delta){
  const it=cart.find(c=>c.id===id);
  const prod = products.find(p=>p.id===id);
  if(!it) return;
  it.qty+=delta;
  if(it.qty<=0) cart.splice(cart.indexOf(it),1);
  if(it.qty>prod.stock) it.qty = prod.stock;
  renderCartPanel(); renderProducts();
}

function checkout(){
  if(cart.length === 0){ alert("Carrito vacío"); return; }
  const clientAddress = prompt("Ingresa tu ubicación (ej: Junín 1366):");
  if(!clientAddress) return alert("Debes ingresar tu ubicación");

  const ref = document.getElementById("orderRef").value || "Sin referencia";

  const items = cart.map(i => `${i.qty}x ${i.name}`).join("\n");
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);

  const msg = `Hola! Tengo un pedido de VapeHouse:\n${items}\nTotal $${total}\nUbicación: ${clientAddress}\nReferencia: ${ref}`;

  orders.push({
    address: clientAddress,
    items,
    total,
    ref,
    date: new Date().toLocaleString()
  });

  cart.forEach(c=>{
    const prod = products.find(p=>p.id===c.id);
    if(prod) prod.stock -= c.qty;
  });

  renderOrders(); renderProducts();
  cart.length = 0; renderCartPanel(); closeCart();

  const myNumber = "5493764522045";
  window.open(`https://wa.me/${myNumber}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Admin
document.getElementById("adminBtn").addEventListener("click", ()=>{
  const pass = prompt("Ingrese contraseña de administrador:");
  if(pass === ADMIN_PASSWORD){
    document.getElementById("adminPanel").style.display = "block";
    renderAdminProducts(); renderOrders();
  } else alert("Contraseña incorrecta");
});

function closeAdmin(){ document.getElementById("adminPanel").style.display = "none"; }

// Admin Tabs
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(tc=>tc.style.display="none");
    document.getElementById(btn.dataset.tab).style.display="block";
  });
});

function addProduct(){
  const name = document.getElementById("prodName").value;
  const desc = document.getElementById("prodDesc").value;
  const price = parseInt(document.getElementById("prodPrice").value);
  const stock = parseInt(document.getElementById("prodStock").value);
  const img = document.getElementById("prodImg").value;
  if(!name||!desc||!price||!stock||!img) return alert("Completa todos los campos");
  const id = products.length ? products[products.length-1].id+1 : 1;
  products.push({id,name,desc,price,img,stock});
  renderProducts(); renderAdminProducts();
  document.getElementById("prodName").value="";
  document.getElementById("prodDesc").value="";
  document.getElementById("prodPrice").value="";
  document.getElementById("prodStock").value="";
  document.getElementById("prodImg").value="";
}

function deleteProduct(id){
  const idx = products.findIndex(p=>p.id===id);
  if(idx!==-1) products.splice(idx,1);
  renderProducts(); renderAdminProducts();
}

function editProduct(id){
  const prod = products.find(p=>p.id===id);
  if(!prod) return;
  const newName = prompt("Nombre:", prod.name);
  const newDesc = prompt("Descripción:", prod.desc);
  const newPrice = prompt("Precio:", prod.price);
  const newStock = prompt("Stock:", prod.stock);
  const newImg = prompt("URL Imagen:", prod.img);
  if(newName) prod.name = newName;
  if(newDesc) prod.desc = newDesc;
  if(newPrice) prod.price = parseInt(newPrice);
  if(newStock) prod.stock = parseInt(newStock);
  if(newImg) prod.img = newImg;
  renderProducts(); renderAdminProducts();
}

function renderAdminProducts(){
  const adminDiv = document.getElementById("adminProducts");
  adminDiv.innerHTML="";
  products.forEach(p=>{
    adminDiv.innerHTML+=`
      <div class="admin-card">
        <img src="${p.img}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <p>Stock: ${p.stock}</p>
        <p>$${formatNum(p.price)}</p>
        <button class="edit-btn" onclick="editProduct(${p.id})">Editar</button>
        <button class="delete-btn" onclick="deleteProduct(${p.id})">Eliminar</button>
      </div>
    `;
  });
}

function renderOrders(){
  const div = document.getElementById("orderHistory");
  div.innerHTML="";
  orders.forEach(o=>{
    div.innerHTML+=`
      <div class="order-card">
        <p><strong>${o.date}</strong></p>
        <p>${o.items.replace(/\n/g,'<br>')}</p>
        <p>Total: $${o.total}</p>
        <p>Ubicación: ${o.address}</p>
        <p>Referencia: ${o.ref}</p>
      </div>
    `;
  });
}

// Carrito panel
document.getElementById("cartBtn").addEventListener("click", ()=>{ 
  document.getElementById("cartPanel").style.display = "block"; renderCartPanel(); 
});
function closeCart(){ document.getElementById("cartPanel").style.display = "none"; }

// Inicializar
document.addEventListener("DOMContentLoaded",()=>{ renderProducts(); });
